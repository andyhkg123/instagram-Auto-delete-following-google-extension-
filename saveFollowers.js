// Wrap in IIFE to prevent scope pollution
(() => {
  // Configuration
  const SCROLL_DELAY = 2000;
  const LOAD_WAIT = 60000;

  // State
  const followers = new Set();
  const processedUsernames = new Set();
  window.stopSaving = false;

  // Helper functions
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const saveToStorage = async (followersArray) => {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ savedFollowers: followersArray }, () => {
          console.log(`💾 Saved ${followersArray.length} followers to storage`);
          resolve();
        });
      } else {
        console.error("Chrome storage not available");
        resolve();
      }
    });
  };

  // Main function
  async function saveFollowers() {
    try {
      console.log("🔍 Starting to save followers...");

      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) throw new Error("Not on followers page");

      const scrollable = [...dialog.querySelectorAll("div")].find((div) => {
        const style = getComputedStyle(div);
        return (
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          div.scrollHeight > div.clientHeight
        );
      });
      if (!scrollable) throw new Error("No scrollable area found");

      let hasMore = true;
      let attemptCount = 0;

      while (hasMore && !window.stopSaving && attemptCount < 3) {
        const userElements = document.querySelectorAll(
          'div[role="dialog"] a[href^="/"]'
        );
        let newUsersFound = false;

        userElements.forEach((el) => {
          if (window.stopSaving) return;

          const username = el.href.split("/")[3];
          if (username && !processedUsernames.has(username)) {
            followers.add(username);
            processedUsernames.add(username);
            newUsersFound = true;
            console.log(`📥 Saved follower: @${username}`);
          }
        });

        if (!newUsersFound) {
          const prevHeight = scrollable.scrollHeight;
          scrollable.scrollTop = scrollable.scrollHeight;
          await wait(SCROLL_DELAY);

          const start = Date.now();
          while (Date.now() - start < LOAD_WAIT && !window.stopSaving) {
            await wait(1000);
            if (scrollable.scrollHeight > prevHeight) break;
          }

          hasMore = scrollable.scrollHeight > prevHeight;
          if (!hasMore) attemptCount++;
        } else {
          attemptCount = 0;

          // Periodic save every 50 new users
          if (followers.size % 50 === 0) {
            await saveToStorage(Array.from(followers));
          }
        }
      }

      // Final save
      await saveToStorage(Array.from(followers));
      console.log(`✅ Successfully saved ${followers.size} followers`);
    } catch (error) {
      console.error("❌ Error:", error.message);
    } finally {
      window.stopSaving = false;
    }
  }

  // Start the process
  saveFollowers();
})();
