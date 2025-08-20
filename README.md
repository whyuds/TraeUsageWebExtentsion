# Trae Usage Web Extension

A browser extension to automatically extract X-Cloudide-Session from trae.ai for usage tracking.

## Features

- Automatically detects and extracts X-Cloudide-Session from trae.ai API requests
- Auto-copies session to clipboard when extension icon is clicked
- Provides quick access to Trae usage page
- Session stays valid longer than JWT tokens
- Toast notification for successful copy operations
- Smart button that changes based on session status

## Installation

### From Release (Recommended)
1. Go to the [Releases](../../releases) page
2. Download the latest `TraeUsageWebExtension.crx` file
3. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
4. Enable "Developer mode" in the top right
5. Drag and drop the `.crx` file onto the extensions page

### From Source
1. Download the latest `TraeUsageWebExtension.zip`
2. Extract the files to a folder
3. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder
6. The extension icon should appear in your toolbar

## Usage

1. Visit trae.ai and browse any page
2. The extension will automatically detect X-Cloudide-Session from API requests
3. Click the extension icon to auto-copy the session to clipboard
4. A toast notification will confirm successful copying
5. The button will change to "Back to Trae" (green) after copying
6. Click "Back to Trae" to minimize browser and return to Trae application

## Development & Release

### Automatic CRX Building
This project uses GitHub Actions to automatically build and release CRX files:

1. **Create a new tag**: `git tag v1.0.0 && git push origin v1.0.0`
2. **GitHub Actions will automatically**:
   - Build the browser extension
   - Generate a CRX file
   - Create a GitHub release
   - Upload both CRX and ZIP files

### Manual Building
```bash
# Install crx3 globally
npm install -g crx3

# Generate a private key (first time only)
openssl genrsa -out key.pem 2048

# Build CRX file
crx3 --keyPath=key.pem --crxPath=TraeUsageWebExtension.crx .
```

## Technical Details

- Uses browser's webRequest API to monitor network requests
- Extracts session from cookies when `/GetUserToken` API is called
- Implements debouncing to handle multiple rapid requests
- Stores session data in browser's local storage
- Toast notifications with smooth animations
- Smart button state management

## Files

- `manifest.json` - Extension configuration
- `background.js` - Background script for request monitoring
- `content.js` - Content script (minimal)
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `package.json` - NPM package configuration
- `.github/workflows/build-crx.yml` - CI/CD pipeline
- `icon*.png` - Extension icons