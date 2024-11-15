export const CSS_NAME = "chameleon/scrollbar";
export const CSS_URL = "showcase/scrollbar.css";
export const CSS_CONTENT = `:host(.ch-scrollable), .ch-scrollable, .scrollable {
  scrollbar-width: thin; scrollbar-color: var(--accents__primary--hover) transparent;
  &::-webkit-scrollbar { width: 8px; height: 8px; background-color: transparent; }
  &::-webkit-scrollbar-thumb { background-color: var(--accents__primary--hover); }
}`;

export const STYLE_SHEET1_NAME = "stylesheet 1";
export const STYLE_SHEET2_NAME = "stylesheet 2";
export const STYLE_SHEET1 = ".custom-rule { background-color: red; }";
export const STYLE_SHEET2 = ".custom-rule-2 { color: black; }";
