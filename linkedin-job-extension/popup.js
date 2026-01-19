// DOM Elements
const pageStatus = document.getElementById('page-status');
const tabCount = document.getElementById('tab-count');
const jobsContainer = document.getElementById('jobs-container');
const collectBtn = document.getElementById('collect-btn');
const openClaudeBtn = document.getElementById('open-claude-btn');
const successMessage = document.getElementById('success-message');
const errorEl = document.getElementById('error');

let linkedInTabs = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await scanForLinkedInTabs();
  setupEventListeners();
});

// Scan all open tabs for LinkedIn job pages
async function scanForLinkedInTabs() {
  try {
    updateStatus('⏳', 'Scanning tabs...');

    const allTabs = await chrome.tabs.query({});
    linkedInTabs = allTabs.filter(tab =>
      tab.url && tab.url.includes('linkedin.com/jobs')
    );

    tabCount.textContent = linkedInTabs.length;

    if (linkedInTabs.length === 0) {
      updateStatus('⚠️', 'No LinkedIn job tabs found');
      jobsContainer.innerHTML = '<div class="no-jobs">Open some LinkedIn job pages first</div>';
      collectBtn.disabled = true;
      return;
    }

    updateStatus('✓', `Found ${linkedInTabs.length} LinkedIn job tab(s)`);
    pageStatus.classList.add('success');

    // Display found tabs
    await displayTabs();

    collectBtn.disabled = false;

  } catch (error) {
    console.error('Error scanning tabs:', error);
    showError('Failed to scan tabs: ' + error.message);
  }
}

// Display tabs with job info
async function displayTabs() {
  jobsContainer.innerHTML = '';

  for (const tab of linkedInTabs) {
    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';
    jobItem.dataset.tabId = tab.id;

    // Try to extract basic info from tab title
    const titleParts = tab.title?.split(' | ') || [];
    const jobTitle = titleParts[0] || 'LinkedIn Job';
    const company = titleParts[1] || '';

    jobItem.innerHTML = `
      <input type="checkbox" checked data-tab-id="${tab.id}">
      <div class="job-info">
        <div class="job-title" title="${jobTitle}">${jobTitle}</div>
        ${company ? `<div class="job-company">${company}</div>` : ''}
      </div>
    `;

    jobsContainer.appendChild(jobItem);
  }
}

// Setup event listeners
function setupEventListeners() {
  collectBtn.addEventListener('click', collectAllJobs);
  openClaudeBtn.addEventListener('click', openClaude);
}

// Collect job descriptions from all selected tabs
async function collectAllJobs() {
  const selectedTabs = [];
  const checkboxes = jobsContainer.querySelectorAll('input[type="checkbox"]:checked');

  checkboxes.forEach(cb => {
    const tabId = parseInt(cb.dataset.tabId);
    const tab = linkedInTabs.find(t => t.id === tabId);
    if (tab) selectedTabs.push(tab);
  });

  if (selectedTabs.length === 0) {
    showError('No tabs selected');
    return;
  }

  collectBtn.disabled = true;
  collectBtn.innerHTML = '<span class="btn-icon">⏳</span> Collecting...';

  try {
    const jobDescriptions = [];

    for (const tab of selectedTabs) {
      try {
        // Inject content script and get job data
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractJobDataFromPage
        });

        if (results && results[0] && results[0].result) {
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
        jobDescriptions.push({
          title: tab.title?.split(' | ')[0] || 'Unknown',
          company: tab.title?.split(' | ')[1] || 'Unknown',
          description: 'Failed to extract - try refreshing this tab',
          url: tab.url
        });
      }
    }

    // Format for Claude
    const formattedText = formatForClaude(jobDescriptions);

    // Copy to clipboard
    await navigator.clipboard.writeText(formattedText);

    // Show success
    successMessage.classList.remove('hidden');
    setTimeout(() => {
      successMessage.classList.add('hidden');
    }, 5000);

  } catch (error) {
    console.error('Collection error:', error);
    showError('Failed to collect jobs: ' + error.message);
  } finally {
    collectBtn.disabled = false;
    collectBtn.innerHTML = '<span class="btn-icon">📋</span> Collect All & Copy to Clipboard';
  }
}

// Format job descriptions for Claude
function formatForClaude(jobs) {
  let text = `I have ${jobs.length} job posting(s) from LinkedIn that I'd like you to analyze:\n\n`;

  jobs.forEach((job, index) => {
    text += `${'='.repeat(60)}\n`;
    text += `JOB ${index + 1}: ${job.title}\n`;
    text += `Company: ${job.company}\n`;
    if (job.location) text += `Location: ${job.location}\n`;
    text += `URL: ${job.url}\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += `${job.description}\n\n`;
  });

  text += `\n${'='.repeat(60)}\n`;
  text += `Please analyze these job postings and help me understand:\n`;
  text += `1. Key requirements and qualifications for each role\n`;
  text += `2. Common themes or skills across these positions\n`;
  text += `3. Which roles might be the best fit based on typical career paths\n`;
  text += `4. Any red flags or things to watch out for\n`;

  return text;
}

// Open Claude chat
function openClaude() {
  chrome.tabs.create({ url: 'https://claude.ai/new' });
}

// Update status display
function updateStatus(icon, text) {
  pageStatus.className = 'status';
  pageStatus.querySelector('.status-icon').textContent = icon;
  pageStatus.querySelector('.status-text').textContent = text;
}

// Show error
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 5000);
}

// Function to be injected into LinkedIn pages
function extractJobDataFromPage() {
  const data = {
    title: null,
    company: null,
    location: null,
    description: null
  };

  // Job title selectors
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title h1',
    '.jobs-unified-top-card__job-title',
    '.t-24.t-bold.jobs-unified-top-card__job-title',
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

  // Company selectors
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.topcard__org-name-link'
  ];

  for (const sel of companySelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      data.company = el.textContent.trim();
      break;
    }
  }

  // Location selectors
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

  // Description selectors
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
      // Clean text
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

      data.description = text
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();

      if (data.description.length > 100) break;
    }
  }

  return data;
}
