export type LampMode = "light" | "dark";

export type ContentMessage =
  | { type: "ping" }
  | { type: "show-sidebar" };
