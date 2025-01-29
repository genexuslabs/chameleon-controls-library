import type {
  ActionGroupDisplayedMarkers,
  ActionGroupItemModel
} from "./types";
import { dropdownItemIsActionable } from "../dropdown/internal/utils";
import { DropdownModel } from "../dropdown/types";
import { DROPDOWN_ITEM_EXPORT_PARTS } from "../../common/reserved-names";
import { h } from "@stencil/core";

export const MARKER_CLASS = "marker";
export const MARKER_HIDDEN_CLASS = `${MARKER_CLASS}--hidden`;
export const MARKER_CLASS_SELECTOR = `.${MARKER_CLASS}`;

const EMPTY_DROPDOWN = undefined;

const renderItem = (
  item: ActionGroupItemModel,
  itemIsVisible: boolean,
  marker: ActionGroupDisplayedMarkers | undefined
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
      <hr aria-orientation="vertical" id={marker?.id} class={markerClasses} />
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
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined
) =>
  model.map((item, index) =>
    renderItem(
      item,
      itemIsVisible(responsiveCollapse, displayedMarkers, index),
      displayedMarkers ? displayedMarkers[index] : undefined
    )
  );
