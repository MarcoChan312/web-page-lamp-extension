import { DEFAULT_LAMP_MODE, DEFAULT_SIDEBAR_AUTO_SHOW, STORAGE_KEYS } from "./defaults";
import type { LampMode } from "./types";

export function getLampMode(): Promise<LampMode> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.lampMode], (result) => {
      const mode = result[STORAGE_KEYS.lampMode];
      if (mode === "dark" || mode === "light") {
        resolve(mode);
        return;
      }
      resolve(DEFAULT_LAMP_MODE);
    });
  });
}

export function setLampMode(mode: LampMode): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.lampMode]: mode }, () => {
      resolve();
    });
  });
}

export function getSidebarAutoShow(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.sidebarAutoShow], (result) => {
      const value = result[STORAGE_KEYS.sidebarAutoShow];
      if (typeof value === "boolean") {
        resolve(value);
        return;
      }
      resolve(DEFAULT_SIDEBAR_AUTO_SHOW);
    });
  });
}

export function setSidebarAutoShow(value: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.sidebarAutoShow]: value }, () => {
      resolve();
    });
  });
}
