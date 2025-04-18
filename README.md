# Instagram Follower Tools

This Chrome Extension helps manage your Instagram followers by:

1.  **Saving your current followers:** Scrapes and stores a list of users who follow you.
2.  **Unfollowing users who don't follow you back:** Iterates through your 'Following' list and unfollows anyone not found in your saved followers list.

## How to Use

1.  **Clone or Download:** Get the extension code onto your computer.
2.  **Load the Extension in Chrome:**
3.  **Save Your Followers:**
    *   Go to your Instagram profile page (`https://www.instagram.com/your_username/`).
    *   Click on your "Followers" count to open the followers list dialog.
    *   **Important:** 
    *   Click the extension icon (usually in the top-right of Chrome).
    *   Click the "Save Followers" button in the extension popup. Check the browser's developer console (F12 -> Console) for progress. It will log ` Saved X followers to storage` when done.
4.  **Unfollow Non-Followers:**
    *   Go to your Instagram profile page again.
    *   Click on your "Following" count to open the following list dialog.
    *   **Important:** Let the list load initially. You *don't* need to scroll all the way down this time, but ensure the first few users are visible.
    *   Click the extension icon.
    *   Click the "Unfollow Non-Followers" button. The extension will start automatically scrolling and unfollowing users who don't follow you back.
    *   Check the developer console for progress (it logs unfollowed/skipped users).
    *   You can click "Stop Process" in the popup to halt the unfollowing script at any time.

## Notes

*   **Use Responsibly:** The daily restriction to unfollow ig page is around 600.Instagram has limits on how many actions (like unfollowing) you can perform in a short time. Using this tool excessively might lead to temporary restrictions on your account. The script has built-in delays (`UNFOLLOW_DELAY`), but be mindful.

*   **Keep List:** The `unfollower.js` script has a hardcoded list of usernames (`originalKeepUsers`) that it will *never* unfollow, even if they don't follow you back. You can edit this list directly in the code if needed.
*   **Updates & Changes:** Instagram's website structure can change, which might break this extension. It relies on specific HTML elements and class names (`_a9--._a9-_`, `_acan._acap._acat._aj1-._ap30`, `div[role="dialog"]`, etc.). If it stops working, these selectors in `saveFollowers.js` and `unfollower.js` likely need updating.
*   **Error Handling:** Basic error handling is included, but issues might still occur. Check the developer console for errors.

## Disclaimer

This tool interacts with Instagram's website in an automated way. Use it at your own risk. The developer is not responsible for any consequences of using this extension, including account suspension or other issues.