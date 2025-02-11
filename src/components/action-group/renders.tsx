import type {
  ActionGroupDisplayedMarkers,
  ActionGroupItemModel
} from "./types";
import { actionMenuItemIsActionable } from "../action-menu/internal/utils";
import {
  ActionMenuImagePathCallback,
  ActionMenuModel
} from "../action-menu/types";
import {
  ACTION_GROUP_PARTS_DICTIONARY,
  ACTION_MENU_ITEM_EXPORT_PARTS,
  ACTION_MENU_ITEM_PARTS_DICTIONARY
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
  getImagePathCallback?: ActionMenuImagePathCallback
) => {
  const markerClasses = marker
    ? {
        [MARKER_CLASS]: true,
        [MARKER_HIDDEN_CLASS]: !itemIsVisible
      }
    : undefined;

  if (actionMenuItemIsActionable(item)) {
    return (
      <ch-action-menu-render
        role="listitem"
        id={marker?.id}
        class={markerClasses}
        disabled={disabled}
        getImagePathCallback={getImagePathCallback}
        exportparts={ACTION_MENU_ITEM_EXPORT_PARTS}
        blockAlign={item.itemsBlockAlign ?? "outside-end"}
        inlineAlign={item.itemsInlineAlign ?? "inside-start"}
        model={itemIsVisible ? item.items : EMPTY_DROPDOWN}
      >
        {item.caption}
      </ch-action-menu-render>
    );
  }

  if (item.type === "separator") {
    return (
      <hr
        id={marker?.id}
        class={markerClasses}
        part={tokenMap({
          [item.id]: !!item.id,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.SEPARATOR]: true,
          [ACTION_GROUP_PARTS_DICTIONARY.VERTICAL]: true,
          [item.parts]: !!item.parts
        })}
      />
    );
  }

  return marker ? (
    <div
      role="listitem"
      id={marker.id}
      class={markerClasses}
      style={!itemIsVisible ? { "inline-size": marker.size } : undefined}
    >
      {itemIsVisible && <slot name={item.id} />}
    </div>
  ) : (
    <slot
      // @ts-expect-error This error is a StencilJS's bug.
      // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot#attributes
      role="listitem"
      name={item.id}
    />
  );
};

const itemIsVisible = (
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  index: number
) => !responsiveCollapse || displayedMarkers[index].displayed;

export const renderItems = (
  model: ActionMenuModel,
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  disabled: boolean,
  getImagePathCallback?: ActionMenuImagePathCallback
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
