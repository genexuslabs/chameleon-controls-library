import { SelectorCategoryData, ObjectData } from "./test-suggest";

import { SuggestItemData } from "../../suggest/suggest-list-item/ch-suggest-list-item";
import { SuggestListData } from "../../suggest/suggest-list/ch-suggest-list";
import { SuggestData } from "../../suggest/ch-suggest";

/**
 * @description This function converts SelectorCategoryData[] SuggestData
 */
export const convertObjectDataToSuggestData = (
  selectorCategoriesData: SelectorCategoryData[]
): SuggestData => {
  const suggestData: SuggestData = {
    suggestItems: null,
    suggestLists: []
  };
  if (selectorCategoriesData.length) {
    selectorCategoriesData.forEach(selectorCategory => {
      const suggestList: SuggestListData = {
        label: selectorCategory.name,
        items: []
      };
      selectorCategory.items.forEach((objectData: ObjectData) => {
        const suggestItem: SuggestItemData = {
          value: objectData.id,

          description: objectData.description,
          icon: objectData.icon
        };
        suggestList.items.push(suggestItem);
      });
      suggestData.suggestLists.push(suggestList);
    });
  }
  return suggestData;
};
