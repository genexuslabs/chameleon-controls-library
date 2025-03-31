import { accordionShowcaseStory } from "./accordion/accordion.showcase";
import { actionGroupShowcaseStory } from "./action-group/action-group.showcase";
import { actionListShowcaseStory } from "./action-list/action-list.showcase";
import { actionMenuShowcaseStory } from "./action-menu/action-menu.showcase";
import { barcodeScannerShowcaseStory } from "./barcode-scanner/barcode-scanner.showcase";
import { chatShowcaseStory } from "./chat/chat.showcase";
import { checkboxShowcaseStory } from "./checkbox/checkbox.showcase";
import { codeDiffEditorShowcaseStory } from "./code-diff-editor/code-diff-editor.showcase";
import { codeEditorShowcaseStory } from "./code-editor/code-editor.showcase";
import { codeShowcaseStory } from "./code/code.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { dialogShowcaseStory } from "./dialog/dialog.showcase";
import { editShowcaseStory } from "./edit/edit.showcase";
import { flexibleLayoutShowcaseStory } from "./flexible-layout/flexible-layout.showcase";
import { imageShowcaseStory } from "./image/image.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { markdownShowcaseStory } from "./markdown/markdown.showcase";
import { navigationListShowcaseStory } from "./navigation-list/navigation-list.showcase";
import { paginatorShowcaseStory } from "./paginator/paginator.showcase";
import { paginatorRenderShowcaseStory } from "./paginator-render/paginator-render.showcase";
import { popoverShowcaseStory } from "./popover/popover.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { radioGroupShowcaseStory } from "./radio-group/radio-group.showcase";
import { segmentedControlShowcaseStory } from "./segmented-control/segmented-control.showcase";
import { shortcutsShowcaseStory } from "./shortcuts/shortcuts.showcase";
import { sidebarShowcaseStory } from "./sidebar/sidebar.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { tabularGridShowcaseStory } from "./tabular-grid/tabular-grid.showcase";
import { tabularGridRenderShowcaseStory } from "./tabular-grid-render/tabular-grid-render.showcase";
import { textBlockShowcaseStory } from "./textblock/textblock.showcase";
import { tooltipShowcaseStory } from "./tooltip/tooltip.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";
import { ChameleonCustomStories, ChameleonStories } from "./types";
import { progressShowcaseStory } from "./progress/progress.showcase";

export const showcaseStories = {
  accordion: accordionShowcaseStory,
  "action-group": actionGroupShowcaseStory,
  "action-menu": actionMenuShowcaseStory,
  "action-list": actionListShowcaseStory,
  "barcode-scanner": barcodeScannerShowcaseStory,
  checkbox: checkboxShowcaseStory,
  chat: chatShowcaseStory,
  code: codeShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dialog: dialogShowcaseStory,
  edit: editShowcaseStory,
  image: imageShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  "navigation-list": navigationListShowcaseStory,
  "paginator-render": paginatorRenderShowcaseStory,
  popover: popoverShowcaseStory,
  progress: progressShowcaseStory,
  qr: qrShowcaseStory,
  "radio-group": radioGroupShowcaseStory,
  "segmented-control": segmentedControlShowcaseStory,
  sidebar: sidebarShowcaseStory,
  slider: sliderShowcaseStory,
  switch: switchShowcaseStory,
  tab: tabShowcaseStory,
  "tabular-grid-render": tabularGridRenderShowcaseStory,
  textblock: textBlockShowcaseStory,
  tooltip: tooltipShowcaseStory,
  "tree-view": treeViewShowcaseStory
} as const satisfies ChameleonStories;

export const showcaseCustomStories = {
  "code-editor": codeEditorShowcaseStory,
  "code-diff-editor": codeDiffEditorShowcaseStory,
  "flexible-layout": flexibleLayoutShowcaseStory,
  "markdown-viewer": markdownShowcaseStory,
  paginator: paginatorShowcaseStory,
  shortcuts: shortcutsShowcaseStory,
  "tabular-grid": tabularGridShowcaseStory
} as const satisfies ChameleonCustomStories;
