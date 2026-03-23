import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { tokenMap } from "../../utilities/mapping/token-map";
import { ACTION_GROUP_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/action-group";
import {
  ACTION_MENU_ITEM_EXPORT_PARTS,
  ACTION_MENU_ITEM_PARTS_DICTIONARY
} from "../../utilities/reserved-names/parts/action-menu";
import { actionMenuItemIsActionable } from "../action-menu/internal/utils";
import type { ActionMenuImagePathCallback, ActionMenuModel } from "../action-menu/types";
import type { ActionGroupDisplayedMarkers, ActionGroupItemModel } from "./types";

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
): TemplateResult | typeof nothing => {
  const markerClasses = marker
    ? {
        [MARKER_CLASS]: true,
        [MARKER_HIDDEN_CLASS]: !itemIsVisible
      }
    : undefined;

  if (actionMenuItemIsActionable(item)) {
    return html`<ch-action-menu-render
      role="listitem"
      id=${marker?.id ?? nothing}
      class=${markerClasses ? classMap(markerClasses) : nothing}
      .disabled=${disabled}
      .getImagePathCallback=${getImagePathCallback}
      exportparts=${ACTION_MENU_ITEM_EXPORT_PARTS}
      .blockAlign=${item.itemsBlockAlign ?? "outside-end"}
      .inlineAlign=${item.itemsInlineAlign ?? "inside-start"}
      .model=${itemIsVisible ? item.items : EMPTY_DROPDOWN}
    >
      ${item.caption}
    </ch-action-menu-render>`;
  }

  if (item.type === "separator") {
    return html`<hr
      id=${marker?.id ?? nothing}
      class=${markerClasses ? classMap(markerClasses) : nothing}
      part=${tokenMap({
        [item.id!]: !!item.id,
        [ACTION_MENU_ITEM_PARTS_DICTIONARY.SEPARATOR]: true,
        [ACTION_GROUP_PARTS_DICTIONARY.VERTICAL]: true,
        [item.parts!]: !!item.parts
      })}
    />`;
  }

  // Slot type
  return marker
    ? html`<div
        role="listitem"
        id=${marker.id}
        class=${classMap(markerClasses!)}
        style=${!itemIsVisible ? `inline-size: ${marker.size}` : nothing}
      >
        ${itemIsVisible ? html`<slot name=${item.id}></slot>` : nothing}
      </div>`
    : html`<slot role="listitem" name=${item.id}></slot>`;
};

const itemIsVisible = (
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  index: number
) => !responsiveCollapse || displayedMarkers![index].displayed;

export const renderItems = (
  model: ActionMenuModel,
  responsiveCollapse: boolean,
  displayedMarkers: ActionGroupDisplayedMarkers[] | undefined,
  disabled: boolean,
  getImagePathCallback?: ActionMenuImagePathCallback
): TemplateResult[] =>
  model.map((item, index) =>
    renderItem(
      item,
      itemIsVisible(responsiveCollapse, displayedMarkers, index),
      displayedMarkers ? displayedMarkers[index] : undefined,
      disabled,
      getImagePathCallback
    )
  ) as TemplateResult[];

