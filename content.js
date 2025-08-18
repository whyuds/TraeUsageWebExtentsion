// Content script for trae.ai pages
// This script runs in the context of trae.ai web pages

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'tokenExtracted') {
    console.log('Trae JWT token has been extracted by the extension');
    // Could add visual feedback on the page if needed
  } else if (request.action === 'showSessionCopiedToast') {
    showSessionCopiedToast();
  } else if (request.action === 'copyToClipboard') {
    // Handle clipboard copy request from background script
    navigator.clipboard.writeText(request.text).then(() => {
      console.log('Text copied to clipboard successfully from content script');
      sendResponse({success: true});
    }).catch((error) => {
      console.error('Failed to copy to clipboard from content script:', error);
      sendResponse({success: false, error: error.message});
    });
    return true; // Keep the message channel open for async response
  }
});

// Show toast notification when session is copied
function showSessionCopiedToast() {
  // Create a toast notification element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #007bff;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    max-width: 350px;
    line-height: 1.4;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="font-size: 18px;">✓</div>
      <div>
        <div style="font-weight: 600; margin-bottom: 2px;">Trae Usage: SessionID 已复制到剪贴板</div>
        <div style="font-size: 12px; opacity: 0.9;">返回 Trae，通过VSCode端扩展Trae Usage自动识别更新</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after 4 seconds with slide out animation
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 4000);
}

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