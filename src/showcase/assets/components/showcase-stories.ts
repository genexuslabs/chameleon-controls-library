import { actionGroupShowcaseStory } from "./action-group/action-group.showcase";
import { actionListShowcaseStory } from "./action-list/action-list.showcase";
import { checkboxShowcaseStory } from "./checkbox/checkbox.showcase";
import { codeShowcaseStory } from "./code/code.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { dialogShowcaseStory } from "./dialog/dialog.showcase";
import { dropdownShowcaseStory } from "./dropdown/dropdown.showcase";
import { flexibleLayoutShowcaseStory } from "./flexible-layout/flexible-layout.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { markdownShowcaseStory } from "./markdown/markdown.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { radioGroupShowcaseStory } from "./radio-group/radio-group.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";

export const showcaseStories = {
  "action-group-in-development": actionGroupShowcaseStory,
  "action-list": actionListShowcaseStory,
  checkbox: checkboxShowcaseStory,
  code: codeShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dialog: dialogShowcaseStory,
  dropdown: dropdownShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  qr: qrShowcaseStory,
  "radio-group": radioGroupShowcaseStory,
  slider: sliderShowcaseStory,
  switch: switchShowcaseStory,
  tab: tabShowcaseStory,
  "tree-view": treeViewShowcaseStory
} as const;

export const showcaseCustomStories = {
  "flexible-layout": flexibleLayoutShowcaseStory,
  markdown: markdownShowcaseStory
};
