// Background script to monitor network requests
let extractedSession = null;
let isSessionFound = false;
let extractionTimeout = null; // 用于防抖的定时器
// 移除防重复复制逻辑，允许每次刷新都重新复制

// Listen for web requests to the Trae API
// Function to extract session from cookies and auto-copy to clipboard
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
      
      // 自动复制到剪贴板
      const sessionWithPrefix = `X-Cloudide-Session=${extractedSession}`;
      await copyToClipboard(sessionWithPrefix);
      
      // 通知content script显示toast
      notifyPageSessionCopied();
      
      console.log('Session auto-copied to clipboard:', extractedSession);
      
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

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    // 在background script中，需要通过content script来复制到剪贴板
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'copyToClipboard',
        text: text
      });
      console.log('Text copied to clipboard successfully');
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

// Function to notify content script to show toast
function notifyPageSessionCopied() {
  // 获取当前活动的trae.ai标签页
  chrome.tabs.query({active: true, url: '*://*.trae.ai/*'}, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showSessionCopiedToast'
      }).catch(error => {
        console.log('Could not send message to content script:', error);
      });
    }
  });
}

// Listen for ide_user_pay_status API requests to trigger cookie extraction
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    console.log('Request URL:', details.url);
    
    // Check if this is the ide_user_pay_status API
    if (details.url.includes('/ide_user_pay_status')) {
      console.log('ide_user_pay_status API detected! Will extract session from the last request...');
      
      // 清除之前的定时器，确保只处理最后一个请求
      if (extractionTimeout) {
        clearTimeout(extractionTimeout);
        console.log('Previous extraction cancelled, waiting for the last request...');
      }
      
      // 设置新的定时器，延迟1000ms执行，确保是最后一个请求
      extractionTimeout = setTimeout(() => {
        console.log('Processing the last ide_user_pay_status request, extracting session from cookies...');
        extractSessionFromCookies();
        extractionTimeout = null;
      }, 1000);
    }
  },
  {urls: ["*://*.trae.ai/*"]},
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