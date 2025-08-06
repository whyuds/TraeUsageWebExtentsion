// Background script to monitor network requests
let extractedToken = null;
let isTokenFound = false;

// Listen for web requests to the Trae API
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    // Check if this is the target API endpoint
    if (details.url.includes('api-sg-central.trae.ai/trae/api/v1/pay/ide_user_pay_status')) {
      // Look for authorization header
      for (let header of details.requestHeaders) {
        if (header.name.toLowerCase() === 'authorization') {
          // Extract the JWT token (everything after 'Cloud-IDE-JWT ')
          const authValue = header.value;
          if (authValue.startsWith('Cloud-IDE-JWT ')) {
            extractedToken = authValue.substring('Cloud-IDE-JWT '.length);
            isTokenFound = true;
            
            // Store the token
            chrome.storage.local.set({ 
              'traeToken': extractedToken,
              'tokenFound': true 
            });
            
            // Update extension icon to indicate success
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
            
            console.log('Trae JWT token extracted:', extractedToken);
            break;
          }
        }
      }
    }
  },
  { urls: ['*://api-sg-central.trae.ai/*'] },
  ['requestHeaders']
);

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '?' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF9800' });
});

// Reset token status when navigating away from trae.ai
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('trae.ai')) {
    chrome.storage.local.set({ 
      'tokenFound': false 
    });
    chrome.action.setBadgeText({ text: '?' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF9800' });
  }
});