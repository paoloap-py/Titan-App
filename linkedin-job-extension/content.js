// Content script for extracting job data from LinkedIn job pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobData') {
    const jobData = extractJobData();
    sendResponse({ success: true, data: jobData });
  }
  return true;
});

// Extract job data from the current LinkedIn job page
function extractJobData() {
  const data = {
    title: null,
    company: null,
    location: null,
    description: null,
    url: window.location.href
  };

  try {
    // Job title - try multiple selectors as LinkedIn changes their HTML frequently
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title',
      '.t-24.t-bold.jobs-unified-top-card__job-title',
      'h1.topcard__title',
      '.job-view-layout h1',
      'h1[class*="job-title"]',
      '.jobs-details-top-card__job-title'
    ];

    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.title = el.textContent.trim();
        break;
      }
    }

    // Company name
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      'a[class*="company-name"]',
      '.jobs-details-top-card__company-url'
    ];

    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.company = el.textContent.trim();
        break;
      }
    }

    // Location
    const locationSelectors = [
      '.job-details-jobs-unified-top-card__primary-description-container .t-black--light',
      '.jobs-unified-top-card__bullet',
      '.topcard__flavor--bullet',
      '.job-details-jobs-unified-top-card__tertiary-description',
      'span[class*="location"]'
    ];

    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.location = el.textContent.trim();
        break;
      }
    }

    // Job description - this is the main content
    const descriptionSelectors = [
      '.jobs-description__content',
      '.jobs-description-content__text',
      '.jobs-box__html-content',
      '#job-details',
      '.job-view-layout .description__text',
      '.jobs-description',
      'article[class*="jobs-description"]',
      '.show-more-less-html__markup'
    ];

    for (const selector of descriptionSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        // Get text content while preserving some structure
        data.description = cleanDescription(el);
        if (data.description && data.description.length > 100) {
          break;
        }
      }
    }

    // If still no description, try to get all text from job details section
    if (!data.description || data.description.length < 100) {
      const jobDetailsContainer = document.querySelector('.jobs-details__main-content') ||
                                   document.querySelector('.job-view-layout') ||
                                   document.querySelector('[class*="job-details"]');
      if (jobDetailsContainer) {
        data.description = cleanDescription(jobDetailsContainer);
      }
    }

  } catch (error) {
    console.error('Error extracting job data:', error);
  }

  return data;
}

// Clean and format the description text
function cleanDescription(element) {
  // Clone the element to avoid modifying the page
  const clone = element.cloneNode(true);

  // Remove unwanted elements
  const unwantedSelectors = [
    'script',
    'style',
    'button',
    '.jobs-description__footer',
    '.show-more-less-html__button',
    '[class*="see-more"]',
    '[class*="show-more"]'
  ];

  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Get text with some formatting preserved
  let text = '';

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      // Add line breaks for block elements
      if (['p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        text += '\n';
      }

      // Add bullet for list items
      if (tagName === 'li') {
        text += '• ';
      }

      // Process children
      node.childNodes.forEach(child => processNode(child));

      // Add extra line break after certain elements
      if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'].includes(tagName)) {
        text += '\n';
      }
    }
  }

  processNode(clone);

  // Clean up the text
  return text
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
    .replace(/[ \t]+/g, ' ')     // Normalize spaces
    .replace(/^\s+|\s+$/g, '')   // Trim
    .replace(/\n +/g, '\n')      // Remove leading spaces on lines
    .trim();
}

// Auto-detect when job details load (for SPA navigation)
function observeJobChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if job content has changed
    const jobContent = document.querySelector('.jobs-description__content, .jobs-description');
    if (jobContent) {
      // Notify that new job data might be available
      chrome.runtime.sendMessage({ action: 'jobDataAvailable' }).catch(() => {
        // Popup might not be open, ignore error
      });
    }
  });

  // Observe the main content area
  const mainContent = document.querySelector('#main') || document.body;
  observer.observe(mainContent, {
    childList: true,
    subtree: true
  });
}

// Initialize
observeJobChanges();
console.log('LinkedIn Job Analyzer content script loaded');
