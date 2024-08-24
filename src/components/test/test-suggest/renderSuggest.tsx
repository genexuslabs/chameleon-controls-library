/* eslint-disable @typescript-eslint/no-use-before-define */
import { h } from "@stencil/core";
import { SuggestItemData } from "../../../deprecated-components/suggest/suggest-list-item/ch-suggest-list-item";
import { SuggestListData } from "../../../deprecated-components/suggest/suggest-list/ch-suggest-list";
import { SuggestData } from "../../../deprecated-components/suggest/ch-suggest";

export const renderSuggestLists = (
  suggestData: SuggestData
): HTMLChSuggestListElement[] => {
  if (suggestData?.suggestLists.length) {
    const randomNumber = Math.random();
    const result = suggestData.suggestLists.map(
      (list: SuggestListData): HTMLChSuggestListElement => {
        return (
          <ch-suggest-list label={list.label} key={randomNumber}>
            {list.items.map((item: SuggestItemData) => {
              return renderSuggestListsItem(item);
            })}
          </ch-suggest-list>
        );
      }
    );
    return result;
  }
  return null;
};

const renderSuggestListsItem = (
  suggestItem: SuggestItemData
): HTMLChSuggestListItemElement => {
  return (
    <ch-suggest-list-item value={suggestItem.value}>
      {[suggestItem.description || suggestItem.value]}
    </ch-suggest-list-item>
  );
};
