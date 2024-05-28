import { actionGroupShowcaseStory } from "./action-group/action-group.showcase";
import { checkboxShowcaseStory } from "./checkbox/checkbox.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { dropdownShowcaseStory } from "./dropdown/dropdown.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { radioGroupShowcaseStory } from "./radio-group/radio-group.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";

export const showcaseStories = {
  "action-group-in-development": actionGroupShowcaseStory,
  checkbox: checkboxShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dropdown: dropdownShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  qr: qrShowcaseStory,
  "radio-group": radioGroupShowcaseStory,
  slider: sliderShowcaseStory,
  switch: switchShowcaseStory,
  tab: tabShowcaseStory,
  "tree-view-in-development": treeViewShowcaseStory
} as const;
