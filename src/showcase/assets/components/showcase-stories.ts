import { accordionShowcaseStory } from "./accordion/accordion.showcase";
import { actionGroupShowcaseStory } from "./action-group/action-group.showcase";
import { actionListShowcaseStory } from "./action-list/action-list.showcase";
import { barcodeScannerShowcaseStory } from "./barcode-scanner/barcode-scanner.showcase";
import { chatShowcaseStory } from "./chat/chat.showcase";
import { checkboxShowcaseStory } from "./checkbox/checkbox.showcase";
import { codeShowcaseStory } from "./code/code.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { dialogShowcaseStory } from "./dialog/dialog.showcase";
import { dropdownShowcaseStory } from "./dropdown/dropdown.showcase";
import { editShowcaseStory } from "./edit/edit.showcase";
import { flexibleLayoutShowcaseStory } from "./flexible-layout/flexible-layout.showcase";
import { imageShowcaseStory } from "./image/image.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { markdownShowcaseStory } from "./markdown/markdown.showcase";
import { navigationListShowcaseStory } from "./navigation-list/navigation-list.showcase";
import { popoverShowcaseStory } from "./popover/popover.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { radioGroupShowcaseStory } from "./radio-group/radio-group.showcase";
import { segmentedControlShowcaseStory } from "./segmented-control/segmented-control.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { textBlockShowcaseStory } from "./textblock/textblock.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";

export const showcaseStories = {
  accordion: accordionShowcaseStory,
  "action-group-in-development": actionGroupShowcaseStory,
  "action-list": actionListShowcaseStory,
  "barcode-scanner": barcodeScannerShowcaseStory,
  checkbox: checkboxShowcaseStory,
  code: codeShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dialog: dialogShowcaseStory,
  dropdown: dropdownShowcaseStory,
  edit: editShowcaseStory,
  image: imageShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  "navigation-list": navigationListShowcaseStory,
  popover: popoverShowcaseStory,
  qr: qrShowcaseStory,
  "radio-group": radioGroupShowcaseStory,
  "segmented-control": segmentedControlShowcaseStory,
  slider: sliderShowcaseStory,
  switch: switchShowcaseStory,
  tab: tabShowcaseStory,
  textblock: textBlockShowcaseStory,
  "tree-view": treeViewShowcaseStory
} as const;

export const showcaseCustomStories = {
  chat: chatShowcaseStory,
  "flexible-layout": flexibleLayoutShowcaseStory,
  markdown: markdownShowcaseStory
};
