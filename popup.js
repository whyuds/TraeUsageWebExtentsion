// Popup script for handling UI interactions
document.addEventListener('DOMContentLoaded', function() {
  const tokenSection = document.getElementById('tokenSection');
  const successMessage = document.getElementById('successMessage');
  const gotoBtn = document.getElementById('gotoBtn');
  const backToTraeBtn = document.getElementById('backToTraeBtn');
  
  // Load stored session data
  chrome.storage.local.get(['traeSession', 'sessionFound'], function(result) {
    if (result.sessionFound && result.traeSession) {
      showSessionFound(result.traeSession);
      // Auto-copy when popup opens if session is found
      copySessionToClipboard(result.traeSession);
    } else {
      showWaitingStatus();
    }
  });
  
  // Listen for storage changes (when session is found)
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      if (changes.sessionFound && changes.sessionFound.newValue) {
        chrome.storage.local.get(['traeSession'], function(result) {
          if (result.traeSession) {
            showSessionFound(result.traeSession);
            // Auto-copy when session is found
            copySessionToClipboard(result.traeSession);
          }
        });
      } else if (changes.sessionFound && !changes.sessionFound.newValue) {
        showWaitingStatus();
      }
    }
  });
  
  // Go to Trae usage page button click handler
  gotoBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.trae.ai/account-setting#usage' });
  });
  
  // Back to VSCode Trae button click handler
  backToTraeBtn.addEventListener('click', function() {
    // Since Trae is a Windows application, we'll try multiple approaches
    // 1. Try to use Windows protocol to focus the application
    // 2. Show a helpful message to user
    
    // Try to trigger Alt+Tab behavior or focus last window
    try {
      // Minimize current browser window to help user see Trae application
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.update(currentWindow.id, { state: 'minimized' });
      });
      
      // Show a temporary notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #333;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        text-align: center;
      `;
      notification.textContent = 'Browser minimized. Please check your taskbar for Trae application.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.log('Could not minimize window:', error);
      alert('Please manually switch to your Trae application using Alt+Tab or click on it in the taskbar.');
    }
  });
  
  // Function to copy session with prefix to clipboard
  function copySessionToClipboard(session) {
    const sessionWithPrefix = `X-Cloudide-Session=${session}`;
    // Use the Clipboard API to copy text
    navigator.clipboard.writeText(sessionWithPrefix).then(function() {
      showSuccessMessage();
    }).catch(function(err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = sessionWithPrefix;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccessMessage();
    });
  }
  
  function showSessionFound(session) {
    tokenSection.style.display = 'block';
  }
  

});