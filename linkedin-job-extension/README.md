# LinkedIn Job Analyzer

A Chrome extension that captures LinkedIn job descriptions and analyzes them using Claude AI.

## Features

- **One-click job capture**: Automatically extracts job title, company, and full description from LinkedIn job pages
- **AI-powered analysis**: Sends job descriptions to Claude for detailed analysis including:
  - Role summary
  - Key requirements
  - Nice-to-have skills
  - Technical stack
  - Red flags
  - Salary insights
  - Application tips
- **History tracking**: Saves your analyzed jobs for future reference
- **Manual paste support**: Works even when not on LinkedIn - just paste any job description

## Installation

### Step 1: Generate Icons

1. Open `icons/generate-icons.html` in your browser
2. Click each download button to save the PNG icons
3. Save them in the `icons` folder as `icon16.png`, `icon48.png`, and `icon128.png`

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `linkedin-job-extension` folder
5. The extension icon should appear in your toolbar

## Usage

### Getting Started

1. Click the extension icon in your Chrome toolbar
2. Enter your Claude API key (get one at [console.anthropic.com](https://console.anthropic.com))
3. Click "Save" to store your API key locally

### Analyzing Jobs

**From LinkedIn:**
1. Navigate to any LinkedIn job posting
2. Click the extension icon
3. Click "Capture Job Description"
4. Click "Analyze with Claude"
5. View the AI-generated analysis

**Manual Entry:**
1. Click the extension icon
2. Paste any job description into the text area
3. Click "Analyze with Claude"

## Privacy

- Your API key is stored locally in your browser and never sent anywhere except to the Anthropic API
- Job descriptions are sent directly to Claude's API for analysis
- Analysis history is stored locally in your browser

## Troubleshooting

**"Could not detect job details"**
- Refresh the LinkedIn page and try again
- LinkedIn frequently updates their HTML structure - the extension tries multiple selectors

**"API error"**
- Verify your Claude API key is correct
- Check that you have API credits available
- Ensure you have internet connectivity

**Extension not appearing**
- Make sure Developer mode is enabled in Chrome extensions
- Try reloading the extension

## Development

### Project Structure

```
linkedin-job-extension/
├── manifest.json      # Chrome extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic & Claude API calls
├── content.js         # LinkedIn page content extraction
├── background.js      # Service worker
├── icons/
│   ├── icon.svg       # Source SVG icon
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extension page icon
│   └── icon128.png    # Chrome Web Store icon
└── README.md
```

### Making Changes

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT
