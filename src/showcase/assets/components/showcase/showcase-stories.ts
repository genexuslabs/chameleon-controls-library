import { checkboxShowcaseStory } from "../checkbox/checkbox.showcase";
import { comboBoxShowcaseStory } from "../combo-box/combo-box.showcase";
import { dropdownShowcaseStory } from "../dropdown/dropdown.showcase";
import { layoutSplitterShowcaseStory } from "../layout-splitter/layout-splitter.showcase";
import { treeViewShowcaseStory } from "../tree-view/tree-view.showcase";

export const showcaseStories = {
  checkbox: checkboxShowcaseStory,
  "combo-box": comboBoxShowcaseStory,
  dropdown: dropdownShowcaseStory,
  "layout-splitter": layoutSplitterShowcaseStory,
  "tree-view-in-development": treeViewShowcaseStory
} as const;
