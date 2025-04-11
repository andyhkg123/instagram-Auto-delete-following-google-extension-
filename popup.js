document.getElementById("saveFollowers").addEventListener("click", () => {
  const status = document.getElementById("saveStatus");
  status.style.display = "none";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
          status.textContent = "Saving followers... check console for progress";
          status.className = "success";
        }
        status.style.display = "block";
      }
    );
  });
});

document
  .getElementById("unfollowNonFollowers")
  .addEventListener("click", () => {
    const status = document.getElementById("unfollowStatus");
    status.style.display = "none";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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

document.getElementById("stopProcess").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (window.stopSaving) window.stopSaving = true;
        if (window.stopUnfollower) window.stopUnfollower = true;
        console.log("Process stopped by user");
      },
    });
  });

  const status = document.getElementById("unfollowStatus");
  status.textContent = "Process stopped. You may need to refresh the page.";
  status.className = "warning";
  status.style.display = "block";
  document.getElementById("stopProcess").disabled = true;
});

// Check if we have saved followers
chrome.storage.local.get(["savedFollowers"], (result) => {
  if (result.savedFollowers) {
    const status = document.getElementById("unfollowStatus");
    status.textContent = `✅ ${result.savedFollowers.length} followers saved`;
    status.className = "success";
    status.style.display = "block";
  }
});
