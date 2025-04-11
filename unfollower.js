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

  // Helper functions
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const getSavedFollowers = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["savedFollowers"], (result) => {
        resolve(result.savedFollowers || []);
      });
    });
  };

  // Main function
  async function unfollowNonFollowers() {
    try {
      console.log("🔍 Starting unfollow process...");

      // 1. Load saved followers + original keep list
      const savedFollowers = await getSavedFollowers();
      const originalKeepUsers = [
        "sycacu",
        "drummer_malmalj",
        "adriannalai" /* your original list */,
      ];
      const keepUsers = [...new Set([...originalKeepUsers, ...savedFollowers])];
      console.log(`🔒 ${keepUsers.length} accounts in keep list`);

      // 2. Find Instagram UI elements
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) throw new Error("Not on following page");

      const scrollable = [...dialog.querySelectorAll("div")].find((div) => {
        const style = getComputedStyle(div);
        return (
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          div.scrollHeight > div.clientHeight
        );
      });
      if (!scrollable) throw new Error("No scrollable area found");

      // 3. Process users
      let hasMore = true;
      while (hasMore && !window.stopUnfollower) {
        const buttons = document.querySelectorAll(
          "button._acan._acap._acat._aj1-._ap30"
        );
        let newUsersFound = false;

        for (const button of buttons) {
          if (window.stopUnfollower) break;

          const root =
            button.closest("div.x9f619")?.parentElement?.parentElement;
          if (!root) continue;

          const spans = root.querySelectorAll("span");
          const usernameElement = [...spans].find((span) =>
            /^[a-zA-Z0-9._]+$/.test(span.textContent.trim())
          );
          const username = usernameElement?.textContent.trim();

          if (!username || processedUsernames.has(username)) continue;

          processedUsernames.add(username);
          newUsersFound = true;

          if (keepUsers.includes(username)) {
            console.log(`⏩ SKIPPING @${username} (in keep list)`);
            root.style.backgroundColor = "lightgreen";
            skipped++;
          } else {
            button.click();
            await wait(500);

            const confirmBtn = document.querySelector("button._a9--._a9-_");
            if (confirmBtn) {
              confirmBtn.click();
              console.log(`✅ UNFOLLOWED @${username}`);
              root.style.backgroundColor = "salmon";
              unfollowed++;
            }
          }

          await wait(UNFOLLOW_DELAY);
        }

        // 4. Scroll for more if needed
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
          if (!hasMore) console.log("⏹ Reached end of following list");
          await wait(SCROLL_DELAY);
        }
      }

      console.log(`🎉 FINAL: Unfollowed ${unfollowed} | Skipped ${skipped}`);
    } catch (error) {
      console.error("❌ Unfollow Error:", error.message);
    } finally {
      window.stopUnfollower = false;
    }
  }

  // Start the process
  unfollowNonFollowers();
})();
