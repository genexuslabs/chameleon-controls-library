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
import { colorFieldShowcaseStory } from "./color-field/color-field.showcase";
import { colorPickerShowcaseStory } from "./color-picker/color-picker.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { counterShowcaseStory } from "./counter/counter.showcase";
import { dialogShowcaseStory } from "./dialog/dialog.showcase";
import { editShowcaseStory } from "./edit/edit.showcase";
import { flexibleLayoutShowcaseStory } from "./flexible-layout/flexible-layout.showcase";
import { imageShowcaseStory } from "./image/image.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { liveKitRoomShowcaseStory } from "./live-kit-room/live-kit-room.showcase";
import { markdownShowcaseStory } from "./markdown/markdown.showcase";
import { mathViewerShowcaseStory } from "./math-viewer/math-viewer.showcase";
import { navigationListShowcaseStory } from "./navigation-list/navigation-list.showcase";
import { paginatorRenderShowcaseStory } from "./paginator-render/paginator-render.showcase";
import { paginatorShowcaseStory } from "./paginator/paginator.showcase";
import { popoverShowcaseStory } from "./popover/popover.showcase";
import { progressShowcaseStory } from "./progress/progress.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { radioGroupShowcaseStory } from "./radio-group/radio-group.showcase";
import { ratingShowcaseStory } from "./rating/rating.showcase";
import { segmentedControlShowcaseStory } from "./segmented-control/segmented-control.showcase";
import { shortcutsShowcaseStory } from "./shortcuts/shortcuts.showcase";
import { sidebarShowcaseStory } from "./sidebar/sidebar.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { statusShowcaseStory } from "./status/status.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { tabularGridRenderShowcaseStory } from "./tabular-grid-render/tabular-grid-render.showcase";
import { tabularGridShowcaseStory } from "./tabular-grid/tabular-grid.showcase";
import { textBlockShowcaseStory } from "./textblock/textblock.showcase";
import { tooltipShowcaseStory } from "./tooltip/tooltip.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";
import { ChameleonCustomStories, ChameleonStories } from "./types";

export const showcaseStories = {
  accordion: accordionShowcaseStory,
  "action-group": actionGroupShowcaseStory,
  "action-menu": actionMenuShowcaseStory,
  "action-list": actionListShowcaseStory,
  "barcode-scanner": barcodeScannerShowcaseStory,
  checkbox: checkboxShowcaseStory,
  chat: chatShowcaseStory,
  code: codeShowcaseStory,
  "color-field": colorFieldShowcaseStory,
  "color-picker": colorPickerShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  counter: counterShowcaseStory,
  dialog: dialogShowcaseStory,
  edit: editShowcaseStory,
  image: imageShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  "navigation-list": navigationListShowcaseStory,
  "live-kit-room": liveKitRoomShowcaseStory,
  "paginator-render": paginatorRenderShowcaseStory,
  popover: popoverShowcaseStory,
  progress: progressShowcaseStory,
  status: statusShowcaseStory,
  qr: qrShowcaseStory,
  rating: ratingShowcaseStory,
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
  "math-viewer": mathViewerShowcaseStory,
  "markdown-viewer": markdownShowcaseStory,
  paginator: paginatorShowcaseStory,
  shortcuts: shortcutsShowcaseStory,
  "tabular-grid": tabularGridShowcaseStory
} as const satisfies ChameleonCustomStories;
