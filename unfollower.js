(() => {
  // Configuration
  const UNFOLLOW_DELAY = 1500;
  const SCROLL_DELAY = 2000;
  const LOAD_WAIT = 60000;

  // State
  let unfollowed = 0;
  let skipped = 0;
  let processedUsernames = new Set();
  window.stopUnfollower = false;
  window.activeUnfollowProcess = true;

  // Helper functions
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const getSavedFollowers = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["savedFollowers"], (result) => {
        resolve(result.savedFollowers || []);
      });
    });
  };

  // Process a single user
  async function processUser(button, keepUsers) {
    if (window.stopUnfollower) return false;

    const root = button.closest("div.x9f619")?.parentElement?.parentElement;
    if (!root) return false;

    const username = [...root.querySelectorAll("span")]
      .find((span) => /^[a-zA-Z0-9._]+$/.test(span.textContent.trim()))
      ?.textContent.trim();

    if (!username || processedUsernames.has(username)) return false;

    processedUsernames.add(username);

    if (keepUsers.includes(username)) {
      console.log(`⏩ SKIPPING @${username}`);
      root.style.backgroundColor = "rgba(144, 238, 144, 0.3)";
      skipped++;
      return true;
    }

    button.click();
    await wait(500);

    const confirmBtn = document.querySelector("button._a9--._a9-_");
    if (confirmBtn) {
      confirmBtn.click();
      console.log(`✅ UNFOLLOWED @${username}`);
      root.style.backgroundColor = "rgba(250, 128, 114, 0.3)";
      unfollowed++;
    }
    await wait(UNFOLLOW_DELAY);
    return true;
  }

  // Main function
  async function unfollowNonFollowers() {
    try {
      console.log("🔍 Starting unfollow process...");

      // Load saved followers + original keep list
      const [savedFollowers, originalKeepUsers] = await Promise.all([
        getSavedFollowers(),
        Promise.resolve([
          "sycacu",
          "drummer_malmalj",
          "adriannalai",
          "kamchuenwonggg",
          // ... rest of your keep list ...
        ]),
      ]);

      const keepUsers = [...new Set([...originalKeepUsers, ...savedFollowers])];
      console.log(`🔒 ${keepUsers.length} accounts in keep list`);

      // Find Instagram UI elements
      const scrollable = [
        ...document.querySelectorAll('div[role="dialog"] div'),
      ].find((div) => {
        const style = getComputedStyle(div);
        return (
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          div.scrollHeight > div.clientHeight
        );
      });
      if (!scrollable) throw new Error("No scrollable area found");

      // Main processing loop
      let hasMore = true;
      while (hasMore && !window.stopUnfollower) {
        const buttons = Array.from(
          document.querySelectorAll("button._acan._acap._acat._aj1-._ap30")
        );
        let newUsersFound = false;

        for (const button of buttons) {
          if (window.stopUnfollower) break;
          newUsersFound =
            (await processUser(button, keepUsers)) || newUsersFound;
        }

        // Scroll for more if needed
        if (!newUsersFound && !window.stopUnfollower) {
          const prevHeight = scrollable.scrollHeight;
          scrollable.scrollTop = scrollable.scrollHeight;
          scrollable.dispatchEvent(new Event("scroll"));

          const start = Date.now();
          let loaded = false;
          while (Date.now() - start < LOAD_WAIT && !window.stopUnfollower) {
            await wait(1000);
            if (scrollable.scrollHeight > prevHeight) {
              loaded = true;
              break;
            }
          }
          hasMore = loaded;
        }
      }

      console.log(`🎉 FINAL: Unfollowed ${unfollowed} | Skipped ${skipped}`);
    } catch (error) {
      console.error("❌ Unfollow Error:", error.message);
    } finally {
      window.stopUnfollower = false;
      window.activeUnfollowProcess = false;
      chrome.runtime.sendMessage({ type: "unfollowComplete" });
      console.log("🔴 Process stopped");
    }
  }

  // Start the process
  unfollowNonFollowers();
})();
