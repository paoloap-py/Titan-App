// Auto-run on extension click
document.addEventListener('DOMContentLoaded', async () => {
  await collectAndCopy();
});

async function collectAndCopy() {
  const statusEl = document.getElementById('status');

  try {
    // Get tabs from current window only
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const linkedInTabs = tabs.filter(tab =>
      tab.url && tab.url.includes('linkedin.com/jobs')
    );

    if (linkedInTabs.length === 0) {
      statusEl.innerHTML = '<span class="error">No LinkedIn job tabs found in this window</span>';
      return;
    }

    statusEl.textContent = `Collecting ${linkedInTabs.length} job(s)...`;

    const jobDescriptions = [];

    for (const tab of linkedInTabs) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractJobDataFromPage
        });

        if (results?.[0]?.result) {
          const data = results[0].result;
          jobDescriptions.push({
            title: data.title || 'Unknown Position',
            company: data.company || 'Unknown Company',
            location: data.location || '',
            description: data.description || 'Could not extract description',
            url: tab.url
          });
        }
      } catch (e) {
        console.error(`Failed to extract from tab ${tab.id}:`, e);
      }
    }

    // Format without the analysis prompt
    const formattedText = formatJobs(jobDescriptions);

    // Copy to clipboard
    await navigator.clipboard.writeText(formattedText);

    // Show success and open Claude
    statusEl.innerHTML = `<span class="success">✓ Copied ${jobDescriptions.length} job(s)! Opening Claude...</span>`;

    // Open Claude in a new window on the right side
    setTimeout(async () => {
      const currentWindow = await chrome.windows.getCurrent();
      const screenWidth = currentWindow.width + currentWindow.left;

      // Position Claude window on the right half of the screen
      chrome.windows.create({
        url: 'https://claude.ai/chat/a5f68798-ae22-455c-98b7-3743fbad94eb',
        type: 'normal',
        left: Math.round(screenWidth / 2),
        top: currentWindow.top,
        width: Math.round(screenWidth / 2),
        height: currentWindow.height
      });

      // Resize current window to left half
      chrome.windows.update(currentWindow.id, {
        left: 0,
        width: Math.round(screenWidth / 2)
      });
    }, 500);

  } catch (error) {
    console.error('Error:', error);
    statusEl.innerHTML = `<span class="error">Error: ${error.message}</span>`;
  }
}

function formatJobs(jobs) {
  let text = '';

  jobs.forEach((job, index) => {
    if (index > 0) text += '\n\n';
    text += `${'='.repeat(60)}\n`;
    text += `${job.title}\n`;
    text += `${job.company}`;
    if (job.location) text += ` | ${job.location}`;
    text += `\n${job.url}\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += job.description;
  });

  return text;
}

function extractJobDataFromPage() {
  const data = { title: null, company: null, location: null, description: null };

  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title h1',
    '.jobs-unified-top-card__job-title',
    'h1.topcard__title',
    '.job-view-layout h1',
    'h1[class*="job-title"]'
  ];

  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      data.title = el.textContent.trim();
      break;
    }
  }

  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.topcard__org-name-link'
  ];

  for (const sel of companySelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      data.company = el.textContent.trim();
      break;
    }
  }

  const locationSelectors = [
    '.job-details-jobs-unified-top-card__primary-description-container .t-black--light',
    '.jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet'
  ];

  for (const sel of locationSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      data.location = el.textContent.trim();
      break;
    }
  }

  const descSelectors = [
    '.jobs-description__content',
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '#job-details',
    '.jobs-description',
    '.show-more-less-html__markup'
  ];

  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('script, style, button').forEach(e => e.remove());

      let text = '';
      function processNode(node) {
        if (node.nodeType === 3) {
          text += node.textContent;
        } else if (node.nodeType === 1) {
          const tag = node.tagName.toLowerCase();
          if (['p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'h4'].includes(tag)) text += '\n';
          if (tag === 'li') text += '• ';
          node.childNodes.forEach(processNode);
          if (['p', 'div', 'ul', 'ol'].includes(tag)) text += '\n';
        }
      }
      processNode(clone);

      data.description = text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
      if (data.description.length > 100) break;
    }
  }

  return data;
}
