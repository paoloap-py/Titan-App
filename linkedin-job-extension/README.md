# LinkedIn Job Collector

A Chrome extension that collects job descriptions from all open LinkedIn job tabs and copies them to your clipboard for pasting into Claude.

## Features

- **Multi-tab scanning**: Automatically detects all open LinkedIn job tabs
- **One-click collection**: Extract job descriptions from all tabs at once
- **Clipboard copy**: Formatted output ready to paste into Claude chat
- **Quick Claude access**: Opens Claude chat with one click

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `linkedin-job-extension` folder

## Usage

1. Open multiple LinkedIn job pages in different tabs
2. Click the extension icon in Chrome toolbar
3. You'll see a list of all detected LinkedIn job tabs
4. Check/uncheck the jobs you want to collect
5. Click **Collect All & Copy to Clipboard**
6. Click **Open Claude Chat**
7. Paste (Ctrl+V / Cmd+V) into Claude

Claude will analyze all the job postings and provide insights on:
- Key requirements for each role
- Common themes across positions
- Best fit recommendations
- Red flags to watch out for

## How It Works

The extension:
1. Scans all open browser tabs for LinkedIn job URLs
2. Injects a script to extract job title, company, location, and description
3. Formats everything into a structured prompt
4. Copies to clipboard for easy pasting into Claude

## Privacy

- No data is sent anywhere except to your clipboard
- No API keys required
- Everything runs locally in your browser
