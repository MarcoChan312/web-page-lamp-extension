const SHOW_SIDEBAR_MESSAGE = { type: "show-sidebar" } as const;
const SIDEBAR_AUTO_SHOW_KEY = "webLampSidebarAutoShow";

function setSidebarAutoShow(value: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SIDEBAR_AUTO_SHOW_KEY]: value }, () => {
      resolve();
    });
  });
}

function isInjectablePage(url?: string): boolean {
  if (!url) {
    // Some tabs may not expose URL details; try inject and let API decide.
    return true;
  }

  const blockedPrefixes = ["chrome://", "edge://", "about:", "chrome-extension://", "edge-extension://"];
  if (blockedPrefixes.some((prefix) => url.startsWith(prefix))) {
    return false;
  }

  if (
    url.startsWith("https://chromewebstore.google.com/") ||
    url.startsWith("https://microsoftedge.microsoft.com/addons/")
  ) {
    return false;
  }

  return /^(https?|file):\/\//.test(url);
}

async function tryShowSidebar(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, SHOW_SIDEBAR_MESSAGE);
    return true;
  } catch {
    return false;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  if (typeof tabId !== "number") {
    return;
  }

  // After first click, keep sidebar auto-show enabled for all supported pages.
  await setSidebarAutoShow(true);

  if (!isInjectablePage(tab.url)) {
    return;
  }

  try {
    await tryShowSidebar(tabId);
  } catch {
    // Keep service worker safe on unsupported pages.
  }
});
