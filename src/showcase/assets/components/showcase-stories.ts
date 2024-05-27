import { checkboxShowcaseStory } from "./checkbox/checkbox.showcase";
import { comboBoxShowcaseStory } from "./combo-box/combo-box.showcase";
import { dropdownShowcaseStory } from "./dropdown/dropdown.showcase";
import { layoutSplitterShowcaseStory } from "./layout-splitter/layout-splitter.showcase";
import { qrShowcaseStory } from "./qr/qr.showcase";
import { sliderShowcaseStory } from "./slider/slider.showcase";
import { switchShowcaseStory } from "./switch/switch.showcase";
import { tabShowcaseStory } from "./tab/tab.showcase";
import { treeViewShowcaseStory } from "./tree-view/tree-view.showcase";

export const showcaseStories = {
  checkbox: checkboxShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dropdown: dropdownShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  qr: qrShowcaseStory,
  slider: sliderShowcaseStory,
  switch: switchShowcaseStory,
  tab: tabShowcaseStory,
  "tree-view-in-development": treeViewShowcaseStory
} as const;
