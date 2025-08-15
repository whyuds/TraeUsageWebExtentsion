// Background script to monitor network requests
let extractedSession = null;
let isSessionFound = false;
let extractionTimeout = null; // 用于防抖的定时器

// Listen for web requests to the Trae API
// Function to extract session from cookies
async function extractSessionFromCookies() {
  try {
    console.log('Attempting to read X-Cloudide-Session cookie from trae.ai domain');
    
    // Get the X-Cloudide-Session cookie from trae.ai domain
    const cookie = await chrome.cookies.get({
      url: 'https://www.trae.ai',
      name: 'X-Cloudide-Session'
    });
    
    if (cookie && cookie.value) {
      extractedSession = cookie.value;
      isSessionFound = true;
      console.log('X-Cloudide-Session found via cookies API:', extractedSession);
      
      // Store the session
      chrome.storage.local.set({
        traeSession: extractedSession,
        sessionFound: true
      });
      
      // Update badge
      chrome.action.setBadgeText({text: '✓'});
      chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
      
      return true;
    } else {
      console.log('X-Cloudide-Session cookie not found');
      return false;
    }
  } catch (error) {
    console.error('Error reading cookies:', error);
    return false;
  }
}

// Listen for GetUserToken API requests to trigger cookie extraction
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    console.log('Request URL:', details.url);
    
    // Check if this is the GetUserToken API
    if (details.url.includes('/GetUserToken')) {
      console.log('GetUserToken API detected! Will extract session from the last request...');
      
      // 清除之前的定时器，确保只处理最后一个请求
      if (extractionTimeout) {
        clearTimeout(extractionTimeout);
        console.log('Previous extraction cancelled, waiting for the last request...');
      }
      
      // 设置新的定时器，延迟500ms执行，确保是最后一个请求
      extractionTimeout = setTimeout(() => {
        console.log('Processing the last GetUserToken request, extracting session from cookies...');
        extractSessionFromCookies();
        extractionTimeout = null;
      }, 500);
    }
  },
  {urls: ["*://api-sg-central.trae.ai/*"]},
  ["requestHeaders"]
);

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  // No default badge - only show when token is found
});

// Reset session status when navigating away from trae.ai
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('trae.ai')) {
    chrome.storage.local.set({ 
      'sessionFound': false 
    });
    chrome.action.setBadgeText({ text: '' });
  }
});