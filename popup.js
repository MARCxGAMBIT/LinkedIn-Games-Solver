// import * as queens from './queens.js';

async function initializePopup() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
  
    // Hide all containers first
    document.querySelectorAll('.container').forEach(el => el.classList.remove('active'));
  
    if (url.includes('linkedin.com/games/queens')) {
      document.getElementById('queensContent').classList.add('active');
      setupQueensHandlers(tab.id);
    } else if (url.includes('linkedin.com/games/tango')) {
      document.getElementById('tangoContent').classList.add('active');
      setupTangoHandlers(tab.id);
    } else {
      document.getElementById('notGameContent').classList.add('active');
    }
  }
  
  function setupQueensHandlers(tabId) {
    document.getElementById('queensSolve').addEventListener('click', () => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['queens.js']
      });
    });
  }
  
  function setupTangoHandlers(tabId) {
    document.getElementById('tangoSolve').addEventListener('click', () => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['tango.js']
      });
    });
  }
  
  // Initialize popup when opened
  document.addEventListener('DOMContentLoaded', initializePopup);