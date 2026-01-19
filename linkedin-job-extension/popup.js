// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const pageStatus = document.getElementById('page-status');
const jobPreview = document.getElementById('job-preview');
const jobTitleEl = document.getElementById('job-title');
const companyNameEl = document.getElementById('company-name');
const captureBtn = document.getElementById('capture-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const jobDescSection = document.getElementById('job-description-section');
const jobDescTextarea = document.getElementById('job-description');
const analysisSection = document.getElementById('analysis-section');
const analysisResult = document.getElementById('analysis-result');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

let currentJobData = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadApiKey();
  await checkCurrentPage();
  setupEventListeners();
});

// Load saved API key
async function loadApiKey() {
  const result = await chrome.storage.local.get(['claudeApiKey']);
  if (result.claudeApiKey) {
    apiKeyInput.value = result.claudeApiKey;
  }
}

// Save API key
async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError('Please enter a valid API key');
    return;
  }

  await chrome.storage.local.set({ claudeApiKey: apiKey });
  showSuccess('API key saved!');
  updateButtonStates();
}

// Check if current page is a LinkedIn job page
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('linkedin.com/jobs')) {
      updateStatus('warning', '⚠️', 'Navigate to a LinkedIn job page to capture');
      captureBtn.disabled = true;
      // Still allow manual paste
      jobDescSection.classList.remove('hidden');
      updateButtonStates();
      return;
    }

    // Try to get job data from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJobData' });

      if (response && response.success) {
        currentJobData = response.data;
        updateStatus('success', '✓', 'LinkedIn job detected');

        if (currentJobData.title || currentJobData.company) {
          jobPreview.classList.remove('hidden');
          jobTitleEl.textContent = currentJobData.title || 'Unknown Position';
          companyNameEl.textContent = currentJobData.company || 'Unknown Company';
        }

        captureBtn.disabled = false;
      } else {
        updateStatus('warning', '⚠️', 'Could not detect job details. Try refreshing the page.');
        jobDescSection.classList.remove('hidden');
      }
    } catch (e) {
      // Content script might not be loaded yet
      updateStatus('warning', '⚠️', 'Refresh the LinkedIn page and try again');
      jobDescSection.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error checking page:', error);
    updateStatus('warning', '⚠️', 'Unable to check page');
    jobDescSection.classList.remove('hidden');
  }

  updateButtonStates();
}

// Update status display
function updateStatus(type, icon, text) {
  pageStatus.className = `status ${type}`;
  pageStatus.querySelector('.status-icon').textContent = icon;
  pageStatus.querySelector('.status-text').textContent = text;
}

// Setup event listeners
function setupEventListeners() {
  saveKeyBtn.addEventListener('click', saveApiKey);

  captureBtn.addEventListener('click', async () => {
    if (currentJobData && currentJobData.description) {
      jobDescTextarea.value = currentJobData.description;
      jobDescSection.classList.remove('hidden');
      updateButtonStates();
      showSuccess('Job description captured!');
    }
  });

  analyzeBtn.addEventListener('click', analyzeWithClaude);

  jobDescTextarea.addEventListener('input', updateButtonStates);

  apiKeyInput.addEventListener('input', updateButtonStates);
}

// Update button states based on current data
function updateButtonStates() {
  const hasApiKey = apiKeyInput.value.trim().length > 0;
  const hasDescription = jobDescTextarea.value.trim().length > 0;

  analyzeBtn.disabled = !hasApiKey || !hasDescription;
}

// Analyze job description with Claude
async function analyzeWithClaude() {
  const apiKey = apiKeyInput.value.trim();
  const description = jobDescTextarea.value.trim();

  if (!apiKey || !description) {
    showError('API key and job description are required');
    return;
  }

  // Show loading state
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  analysisSection.classList.add('hidden');
  analyzeBtn.disabled = true;

  try {
    const analysis = await callClaudeAPI(apiKey, description);

    // Display results
    analysisResult.innerHTML = formatAnalysis(analysis);
    analysisSection.classList.remove('hidden');

    // Save to history
    await saveToHistory({
      title: currentJobData?.title || 'Manual Entry',
      company: currentJobData?.company || 'Unknown',
      description: description,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    showError(error.message || 'Failed to analyze job description');
  } finally {
    loadingEl.classList.add('hidden');
    updateButtonStates();
  }
}

// Call Claude API
async function callClaudeAPI(apiKey, jobDescription) {
  const systemPrompt = `You are a career advisor analyzing job descriptions. Provide a concise, structured analysis including:

1. **Role Summary**: 2-3 sentence overview of the position
2. **Key Requirements**: Bullet list of must-have qualifications
3. **Nice-to-Have Skills**: Secondary qualifications that would help
4. **Technical Stack**: Technologies, tools, and platforms mentioned
5. **Red Flags**: Any concerning aspects (unrealistic requirements, vague descriptions, etc.)
6. **Salary Insight**: If mentioned, or market estimate based on role
7. **Application Tips**: 2-3 specific suggestions for applying

Be direct and practical. Focus on actionable insights.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Please analyze this LinkedIn job description:\n\n${jobDescription}`
        }
      ],
      system: systemPrompt
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Format analysis for display
function formatAnalysis(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h4>$1</h4>')
    .replace(/^# (.*$)/gm, '<h4>$1</h4>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Save analysis to history
async function saveToHistory(entry) {
  const result = await chrome.storage.local.get(['jobHistory']);
  const history = result.jobHistory || [];
  history.unshift(entry);

  // Keep only last 50 entries
  if (history.length > 50) {
    history.pop();
  }

  await chrome.storage.local.set({ jobHistory: history });
}

// Show error message
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => {
    errorEl.classList.add('hidden');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  updateStatus('success', '✓', message);
  setTimeout(() => {
    checkCurrentPage();
  }, 2000);
}
