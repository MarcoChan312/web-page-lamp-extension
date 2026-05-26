import type { LampMode } from "../shared/types";

const SIDEBAR_ID = "web-lamp-sidebar";
const LAMP_BUTTON_ID = "web-lamp-button-light";
const BASE_RIGHT_OFFSET = 12;
const VIEWPORT_GAP = 8;
const DRAG_THRESHOLD_PX = 3;

const LIGHT_TITLE = "\u5f00\u706f\u4e2d\uff0c\u70b9\u51fb\u5173\u706f";
const DARK_TITLE = "\u5173\u706f\u4e2d\uff0c\u70b9\u51fb\u5f00\u706f";
const CLOSE_TITLE = "\u5173\u95ed\u4fa7\u680f";
let detachViewportGuard: (() => void) | null = null;
let dragPointerId: number | null = null;
let dragStartClientY = 0;
let dragStartTop = 0;
let dragTopOverridePx: number | null = null;
let suppressNextLampClick = false;

function getLampTitle(mode: LampMode): string {
  return mode === "light" ? LIGHT_TITLE : DARK_TITLE;
}

function getLampButton(): HTMLButtonElement | null {
  return document.getElementById(LAMP_BUTTON_ID) as HTMLButtonElement | null;
}

function appendEmoji(button: HTMLButtonElement, emoji: string): void {
  const icon = document.createElement("span");
  icon.className = "web-lamp-emoji";
  icon.textContent = emoji;
  button.appendChild(icon);
}

function clampTop(sidebar: HTMLElement, top: number): number {
  const height = sidebar.getBoundingClientRect().height || sidebar.offsetHeight || 0;
  const minTop = VIEWPORT_GAP;
  const maxTop = Math.max(minTop, window.innerHeight - height - VIEWPORT_GAP);
  return Math.min(maxTop, Math.max(minTop, top));
}

function applyTopOverride(sidebar: HTMLElement): void {
  if (dragTopOverridePx === null) {
    return;
  }

  const clampedTop = clampTop(sidebar, dragTopOverridePx);
  dragTopOverridePx = clampedTop;
  sidebar.style.top = `${clampedTop}px`;
  sidebar.style.transform = "none";
}

function keepSidebarInViewport(sidebar: HTMLElement): void {
  sidebar.style.right = `${BASE_RIGHT_OFFSET}px`;
  const rect = sidebar.getBoundingClientRect();
  const overflowRight = rect.right + VIEWPORT_GAP - window.innerWidth;
  if (overflowRight > 0) {
    sidebar.style.right = `${BASE_RIGHT_OFFSET + overflowRight}px`;
  }
  applyTopOverride(sidebar);
}

function installViewportGuard(sidebar: HTMLElement): void {
  const updatePosition = () => {
    keepSidebarInViewport(sidebar);
  };

  detachViewportGuard?.();
  window.addEventListener("resize", updatePosition, { passive: true });
  window.visualViewport?.addEventListener("resize", updatePosition);
  window.visualViewport?.addEventListener("scroll", updatePosition);

  detachViewportGuard = () => {
    window.removeEventListener("resize", updatePosition);
    window.visualViewport?.removeEventListener("resize", updatePosition);
    window.visualViewport?.removeEventListener("scroll", updatePosition);
  };

  requestAnimationFrame(() => {
    updatePosition();
    requestAnimationFrame(updatePosition);
  });
}

function startVerticalDrag(event: PointerEvent, sidebar: HTMLElement, lampButton: HTMLButtonElement): void {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  event.preventDefault();
  const rect = sidebar.getBoundingClientRect();
  dragTopOverridePx = dragTopOverridePx === null ? rect.top : dragTopOverridePx;
  dragPointerId = event.pointerId;
  dragStartClientY = event.clientY;
  dragStartTop = dragTopOverridePx;
  suppressNextLampClick = false;
  lampButton.classList.add("web-lamp-dragging");
  lampButton.setPointerCapture(event.pointerId);
}

function updateVerticalDrag(event: PointerEvent, sidebar: HTMLElement): void {
  if (dragPointerId !== event.pointerId) {
    return;
  }

  const deltaY = event.clientY - dragStartClientY;
  if (Math.abs(deltaY) >= DRAG_THRESHOLD_PX) {
    suppressNextLampClick = true;
  }

  dragTopOverridePx = dragStartTop + deltaY;
  keepSidebarInViewport(sidebar);
}

function endVerticalDrag(event: PointerEvent, lampButton: HTMLButtonElement): void {
  if (dragPointerId !== event.pointerId) {
    return;
  }

  dragPointerId = null;
  lampButton.classList.remove("web-lamp-dragging");
  if (lampButton.hasPointerCapture(event.pointerId)) {
    lampButton.releasePointerCapture(event.pointerId);
  }
}

export function createSidebar(onToggleLamp: () => void, onCloseSidebar: () => void): void {
  const existing = document.getElementById(SIDEBAR_ID);
  if (existing) {
    keepSidebarInViewport(existing);
    return;
  }

  const sidebar = document.createElement("div");
  sidebar.id = SIDEBAR_ID;

  const lampButton = document.createElement("button");
  lampButton.id = LAMP_BUTTON_ID;
  lampButton.className = "web-lamp-button web-lamp-button-light";
  lampButton.type = "button";
  appendEmoji(lampButton, "\uD83D\uDCA1");
  lampButton.title = LIGHT_TITLE;
  lampButton.addEventListener("click", (event) => {
    if (suppressNextLampClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextLampClick = false;
      return;
    }
    onToggleLamp();
  });
  lampButton.addEventListener("pointerdown", (event) => {
    startVerticalDrag(event, sidebar, lampButton);
  });
  lampButton.addEventListener("pointermove", (event) => {
    updateVerticalDrag(event, sidebar);
  });
  lampButton.addEventListener("pointerup", (event) => {
    endVerticalDrag(event, lampButton);
  });
  lampButton.addEventListener("pointercancel", (event) => {
    endVerticalDrag(event, lampButton);
  });

  const closeButton = document.createElement("button");
  closeButton.id = "web-lamp-button-close";
  closeButton.className = "web-lamp-close-badge";
  closeButton.type = "button";
  closeButton.textContent = "\u00d7";
  closeButton.title = CLOSE_TITLE;
  closeButton.addEventListener("click", onCloseSidebar);

  sidebar.appendChild(lampButton);
  sidebar.appendChild(closeButton);
  document.documentElement.appendChild(sidebar);
  installViewportGuard(sidebar);
}

export function removeSidebar(): void {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) {
    sidebar.remove();
  }
  dragPointerId = null;
  detachViewportGuard?.();
  detachViewportGuard = null;
}

export function updateLampButton(mode: LampMode): void {
  const lampButton = getLampButton();
  if (!lampButton) {
    return;
  }

  lampButton.dataset.mode = mode;
  lampButton.title = getLampTitle(mode);
}
