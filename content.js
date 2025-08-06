// Content script for trae.ai pages
// This script runs in the context of trae.ai web pages

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'tokenExtracted') {
    console.log('Trae JWT token has been extracted by the extension');
    // Could add visual feedback on the page if needed
  }
});

// Optional: Add visual indicator on the page when token is extracted
function showPageNotification(message) {
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Monitor for specific API calls (as backup to background script)
// This could be useful for additional page-level monitoring
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('api-sg-central.trae.ai/trae/api/v1/pay/ide_user_pay_status')) {
    console.log('Detected Trae API call:', url);
  }
  return originalFetch.apply(this, args);
};

// Monitor XMLHttpRequest as well
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  if (typeof url === 'string' && url.includes('api-sg-central.trae.ai/trae/api/v1/pay/ide_user_pay_status')) {
    console.log('Detected Trae XHR call:', url);
  }
  return originalXHROpen.call(this, method, url, ...args);
};

console.log('Trae Token Extractor content script loaded');