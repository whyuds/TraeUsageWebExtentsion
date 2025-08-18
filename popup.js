// Popup script for handling UI interactions
document.addEventListener('DOMContentLoaded', function() {
  const toast = document.getElementById('toast');
  const actionBtn = document.getElementById('actionBtn');
  const helpIcon = document.getElementById('helpIcon');
  const helpContent = document.getElementById('helpContent');
  
  // Help icon click handler
  helpIcon.addEventListener('click', function() {
    helpContent.classList.toggle('show');
  });
  
  // Hide help content when clicking outside
  document.addEventListener('click', function(event) {
    if (!helpIcon.contains(event.target) && !helpContent.contains(event.target)) {
      helpContent.classList.remove('show');
    }
  });
  
  // Action button click handler - Go to Trae usage page
  actionBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.trae.ai/account-setting#usage' });
  });
  


});