chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    // Listen for URL changes on LinkedIn
    if (changeInfo.url && changeInfo.url.includes('linkedin.com/games')) {
      chrome.tabs.sendMessage(tabId, {
        message: 'urlChanged',
        url: changeInfo.url
      }).catch(() => {
        // Ignore errors if content script is not ready
      });
    }
  }
);
