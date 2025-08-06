// Popup script for handling UI interactions
document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const tokenSection = document.getElementById('tokenSection');
  const tokenDisplay = document.getElementById('tokenDisplay');
  const copyBtn = document.getElementById('copyBtn');
  const successMessage = document.getElementById('successMessage');
  
  // Load stored token data
  chrome.storage.local.get(['traeToken', 'tokenFound'], function(result) {
    if (result.tokenFound && result.traeToken) {
      showTokenFound(result.traeToken);
    } else {
      showWaitingStatus();
    }
  });
  
  // Listen for storage changes (when token is found)
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      if (changes.tokenFound && changes.tokenFound.newValue) {
        chrome.storage.local.get(['traeToken'], function(result) {
          if (result.traeToken) {
            showTokenFound(result.traeToken);
          }
        });
      } else if (changes.tokenFound && !changes.tokenFound.newValue) {
        showWaitingStatus();
      }
    }
  });
  
  // Copy button click handler
  copyBtn.addEventListener('click', function() {
    chrome.storage.local.get(['traeToken'], function(result) {
      if (result.traeToken) {
        // Use the Clipboard API to copy text
        navigator.clipboard.writeText(result.traeToken).then(function() {
          showSuccessMessage();
        }).catch(function(err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = result.traeToken;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showSuccessMessage();
        });
      }
    });
  });
  
  function showTokenFound(token) {
    statusDiv.className = 'status success';
    statusDiv.textContent = 'JWT Token 已找到!';
    
    tokenDisplay.textContent = token;
    tokenSection.style.display = 'block';
  }
  
  function showWaitingStatus() {
    statusDiv.className = 'status waiting';
    statusDiv.textContent = '等待检测API请求...';
    
    tokenSection.style.display = 'none';
    successMessage.style.display = 'none';
  }
  
  function showSuccessMessage() {
    successMessage.style.display = 'block';
    setTimeout(function() {
      successMessage.style.display = 'none';
    }, 2000);
  }
});