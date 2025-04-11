// Track active tab
let activeTabId = null;

// Save Followers Button
document.getElementById("saveFollowers").addEventListener("click", () => {
  const status = document.getElementById("saveStatus");
  status.style.display = "none";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    activeTabId = tabs[0].id;
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["saveFollowers.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          status.textContent = "Error: " + chrome.runtime.lastError.message;
          status.className = "error";
        } else {
          status.textContent = "Saving followers... check console";
          status.className = "success";
        }
        status.style.display = "block";
      }
    );
  });
});

// Unfollow Button
document
  .getElementById("unfollowNonFollowers")
  .addEventListener("click", () => {
    const status = document.getElementById("unfollowStatus");
    status.style.display = "none";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      activeTabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["unfollower.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            status.textContent = "Error: " + chrome.runtime.lastError.message;
            status.className = "error";
          } else {
            status.textContent = "Unfollowing non-followers... check console";
            status.className = "success";
            document.getElementById("stopProcess").disabled = false;
          }
          status.style.display = "block";
        }
      );
    });
  });

// Stop Process Button
document.getElementById("stopProcess").addEventListener("click", () => {
  if (activeTabId) {
    chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      func: () => {
        if (window.activeUnfollowProcess) {
          window.stopUnfollower = true;
          console.log("🛑 Process stopped by user");
        }
      },
    });
  }

  const status = document.getElementById("unfollowStatus");
  status.textContent = "Process stopped. No refresh needed.";
  status.className = "warning";
  status.style.display = "block";
  document.getElementById("stopProcess").disabled = true;
});

// Check for saved followers on startup
chrome.storage.local.get(["savedFollowers"], (result) => {
  if (result.savedFollowers) {
    const status = document.getElementById("unfollowStatus");
    status.textContent = `✅ ${result.savedFollowers.length} followers saved`;
    status.className = "success";
    status.style.display = "block";
  }
});
