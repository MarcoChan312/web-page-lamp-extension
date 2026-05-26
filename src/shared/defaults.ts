import type { LampMode } from "./types";

export const STORAGE_KEYS = {
  lampMode: "webLampMode",
  sidebarAutoShow: "webLampSidebarAutoShow"
} as const;

export const DEFAULT_LAMP_MODE: LampMode = "light";
export const DEFAULT_SIDEBAR_AUTO_SHOW = false;
