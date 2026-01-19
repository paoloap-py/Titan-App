// Background service worker for LinkedIn Job Analyzer

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'jobDataAvailable') {
    // Could be used to show badge or notification
    console.log('New job data available');
  }
  return true;
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('LinkedIn Job Analyzer installed');

    // Open welcome/setup page on first install (optional)
    // chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    console.log('LinkedIn Job Analyzer updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle keyboard shortcuts (optional - can be configured in manifest)
chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'capture-job') {
    // Could trigger job capture from keyboard shortcut
    console.log('Capture job command triggered');
  }
});
