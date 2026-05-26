import type { LampMode } from "../shared/types";

const MODE_STYLE_ID = "web-lamp-mode-style";

const DARK_MODE_CSS = `
:root {
  color-scheme: dark !important;
}

html,
body {
  background-color: #17191d !important;
  color: #e6e8eb !important;
}

html body :where(
  main,
  article,
  section,
  aside,
  nav,
  header,
  footer,
  div,
  ul,
  ol,
  li,
  dl,
  dt,
  dd,
  p,
  blockquote,
  figure,
  figcaption,
  table,
  thead,
  tbody,
  tfoot,
  tr,
  th,
  td,
  form,
  fieldset,
  legend,
  label,
  details,
  summary,
  dialog
) {
  background-color: transparent !important;
  border-color: rgba(190, 196, 207, 0.24) !important;
}

html body :where(
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  li,
  dt,
  dd,
  label,
  strong,
  em,
  small,
  b,
  i
) {
  color: #e6e8eb !important;
}

html body a {
  color: #9bc8ff !important;
}

html body a:visited {
  color: #c2b2ff !important;
}

html body :is(input, textarea, select, button) {
  background-color: #232730 !important;
  color: #e6e8eb !important;
  border-color: #404859 !important;
}

html body :is(pre, code, kbd, samp) {
  background-color: #20242c !important;
  color: #e9edf5 !important;
}

html body table {
  background-color: #1a1e25 !important;
}

html body th,
html body td {
  background-color: transparent !important;
}

html body :where(hr) {
  border-color: rgba(190, 196, 207, 0.24) !important;
}

img,
video,
canvas,
svg,
picture,
iframe,
embed,
object {
  filter: none !important;
  opacity: 1 !important;
}
`;

export function applyLampMode(mode: LampMode): void {
  if (mode === "light") {
    removeLampModeStyle();
    return;
  }

  ensureLampModeStyle();
}

function ensureLampModeStyle(): void {
  const existing = document.getElementById(MODE_STYLE_ID) as HTMLStyleElement | null;
  if (existing) {
    return;
  }

  const style = document.createElement("style");
  style.id = MODE_STYLE_ID;
  style.textContent = DARK_MODE_CSS;
  (document.head || document.documentElement).appendChild(style);
}

function removeLampModeStyle(): void {
  const existing = document.getElementById(MODE_STYLE_ID);
  if (existing) {
    existing.remove();
  }
}
