import { applyLampMode } from "./applyMode";
import { createSidebar, removeSidebar, updateLampButton } from "./sidebar";
import { DEFAULT_LAMP_MODE, STORAGE_KEYS } from "../shared/defaults";
import { getLampMode, getSidebarAutoShow, setLampMode, setSidebarAutoShow } from "../shared/storage";
import type { ContentMessage, LampMode } from "../shared/types";

let currentMode: LampMode = DEFAULT_LAMP_MODE;
let initialized = false;
let sidebarAutoShow = false;

function handleAsyncError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Extension context invalidated")) {
    return;
  }
  // Keep unexpected errors visible in console for debugging.
  console.error(error);
}

async function initializeState(): Promise<void> {
  if (initialized) {
    return;
  }

  const [savedMode, savedAutoShow] = await Promise.all([getLampMode(), getSidebarAutoShow()]);
  currentMode = savedMode;
  sidebarAutoShow = savedAutoShow;
  applyLampMode(currentMode);
  initialized = true;
}

async function toggleLampMode(): Promise<void> {
  const nextMode: LampMode = currentMode === "light" ? "dark" : "light";
  currentMode = nextMode;
  applyLampMode(nextMode);
  updateLampButton(nextMode);
  await setLampMode(nextMode);
}

function closeSidebarOnly(): void {
  // 关闭侧栏时同步关闭全局自动显示，其他页面会通过 storage 事件同时收起侧栏。
  sidebarAutoShow = false;
  removeSidebar();
  void setSidebarAutoShow(false).catch(handleAsyncError);
}

async function showSidebar(): Promise<void> {
  await initializeState();
  applyLampMode(currentMode);
  createSidebar(
    () => {
      void toggleLampMode().catch(handleAsyncError);
    },
    closeSidebarOnly
  );
  updateLampButton(currentMode);
}

async function maybeAutoShowSidebar(): Promise<void> {
  await initializeState();
  if (sidebarAutoShow) {
    await showSidebar();
  }
}

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  if (message.type === "ping") {
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "show-sidebar") {
    void (async () => {
      try {
        sidebarAutoShow = true;
        await setSidebarAutoShow(true);
        await showSidebar();
        sendResponse({ ok: true });
      } catch (error) {
        handleAsyncError(error);
        sendResponse({ ok: false });
      }
    })().catch(handleAsyncError);
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (STORAGE_KEYS.lampMode in changes) {
    const nextValue = changes[STORAGE_KEYS.lampMode]?.newValue;
    if (nextValue === "light" || nextValue === "dark") {
      currentMode = nextValue;
      applyLampMode(currentMode);
      updateLampButton(currentMode);
    }
  }

  if (STORAGE_KEYS.sidebarAutoShow in changes) {
    const nextAutoShow = changes[STORAGE_KEYS.sidebarAutoShow]?.newValue;
    if (typeof nextAutoShow === "boolean") {
      sidebarAutoShow = nextAutoShow;
      if (sidebarAutoShow) {
        void showSidebar().catch(handleAsyncError);
      } else {
        removeSidebar();
      }
    }
  }
});

void maybeAutoShowSidebar().catch(handleAsyncError);
