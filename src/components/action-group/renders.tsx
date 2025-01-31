import type {
  ActionGroupDisplayedMarkers,
  ActionGroupItemModel
} from "./types";
import { dropdownItemIsActionable } from "../dropdown/internal/utils";
import { DropdownImagePathCallback, DropdownModel } from "../dropdown/types";
import {
  ACTION_GROUP_PARTS_DICTIONARY,
  DROPDOWN_ITEM_EXPORT_PARTS,
  DROPDOWN_ITEM_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { h } from "@stencil/core";
import { tokenMap } from "../../common/utils";

export const MARKER_CLASS = "marker";
export const MARKER_HIDDEN_CLASS = `${MARKER_CLASS}--hidden`;
export const MARKER_CLASS_SELECTOR = `.${MARKER_CLASS}`;

const EMPTY_DROPDOWN = undefined;

const renderItem = (
  item: ActionGroupItemModel,
  itemIsVisible: boolean,
  marker: ActionGroupDisplayedMarkers | undefined,
  disabled: boolean,
  getImagePathCallback?: DropdownImagePathCallback
) => {
  const markerClasses = marker
    ? {
        [MARKER_CLASS]: true,
        [MARKER_HIDDEN_CLASS]: !itemIsVisible
      }
    : undefined;

  if (dropdownItemIsActionable(item)) {
    return (
      <ch-dropdown-render
        role="listitem"
        id={marker?.id}
        class={markerClasses}
        disabled={disabled}
        getImagePathCallback={getImagePathCallback}
        exportparts={DROPDOWN_ITEM_EXPORT_PARTS}
        blockAlign={item.itemsBlockAlign ?? "outside-end"}
        inlineAlign={item.itemsInlineAlign ?? "inside-start"}
        model={itemIsVisible ? item.items : EMPTY_DROPDOWN}
      >
        {item.caption}
      </ch-dropdown-render>
    );
  }

  if (item.type === "separator") {
    return (
      <hr
        aria-orientation="vertical"
        id={marker?.id}
        class={markerClasses}
        part={tokenMap({
          [item.id]: !!item.id,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.SEPARATOR]: true,
          [ACTION_GROUP_PARTS_DICTIONARY.VERTICAL]: true,
          [item.part]: !!item.part
        })}
      />
    );
  }

  return marker ? (
    <div
      id={marker.id}
      class={markerClasses}
      style={!itemIsVisible ? { "inline-size": marker.size } : undefined}
    >
      {itemIsVisible && <slot name={item.id} />}
    </div>
  ) : (
    <slot name={item.id} />
  );
};

const itemIsVisible = (
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  index: number
) => !responsiveCollapse || displayedMarkers[index].displayed;

export const renderItems = (
  model: DropdownModel,
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  disabled: boolean,
  getImagePathCallback?: DropdownImagePathCallback
) =>
  model.map((item, index) =>
    renderItem(
      item,
      itemIsVisible(responsiveCollapse, displayedMarkers, index),
      displayedMarkers ? displayedMarkers[index] : undefined,
      disabled,
      getImagePathCallback
    )
  );
