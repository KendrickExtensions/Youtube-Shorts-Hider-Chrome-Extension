// background.js

// Logs a message when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("Hide YT Shorts - Enhanced extension installed!");
      // Default settings on install
      chrome.storage.sync.set({ hideShorts: true, theme: 'dark' }, () => {
        console.log("Default settings applied.");
      });
    } else if (details.reason === "update") {
      console.log("Extension updated from " + details.previousVersion);
    }
  });
  
  // Handles clicks on the extension icon
  chrome.action.onClicked.addListener(() => {
    console.log("Extension icon clicked!");
    
    // Toggle visibility of YouTube Shorts globally
    chrome.storage.sync.get(['hideShorts'], (result) => {
      const newHideShorts = !result.hideShorts;
      chrome.storage.sync.set({ hideShorts: newHideShorts }, () => {
        console.log("Updated hideShorts setting:", newHideShorts);
        
        // Send message to content script to update the UI
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: updateShortsVisibility,
            args: [newHideShorts]
          });
        });
      });
    });
  });
  
  // Function to update the visibility of Shorts on the page
  function updateShortsVisibility(hide) {
    const elements = document.querySelectorAll("ytd-video-renderer, ytd-shelf-renderer");
    elements.forEach(element => {
      if (hide && element.querySelector('[href^="/shorts/"]')) {
        element.setAttribute("hidden", true);
      } else {
        element.removeAttribute("hidden");
      }
    });
  }
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "toggleShorts") {
      // Toggle Shorts visibility
      chrome.storage.sync.get(['hideShorts'], (result) => {
        const newHideShorts = !result.hideShorts;
        chrome.storage.sync.set({ hideShorts: newHideShorts }, () => {
          sendResponse({ status: 'success', newSetting: newHideShorts });
        });
      });
      return true; // Indicates we will send a response asynchronously
    }
  });
  
  // Manage event listeners for browser actions (such as clearing storage)
  chrome.commands.onCommand.addListener((command) => {
    if (command === "clear-settings") {
      chrome.storage.sync.clear(() => {
        console.log("Extension settings cleared.");
      });
    }
  });
  