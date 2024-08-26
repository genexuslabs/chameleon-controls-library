import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  forceUpdate,
  h
} from "@stencil/core";

import { GxImageMultiState } from "../../common/types";
import { getControlRegisterProperty } from "../../common/registry-properties";
import { NavigationListItem, NavigationListModel } from "./types";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

// items != null comparison is based on the following benchmark
// https://www.measurethat.net/Benchmarks/Show/6389/0/compare-comparison-with-null-or-undefined
const defaultRender = (
  item: NavigationListItem,
  navigationListState: ChNavigationListRender,
  level: number
) => (
  <ch-navigation-list-item
    id={item.id}
    caption={item.caption}
    disabled={item.disabled}
    expandable={item.items != null}
    expandableButton={navigationListState.expandableButton}
    expandableButtonPosition={navigationListState.expandableButtonPosition}
    expanded={item.expanded}
    level={item.level}
    model={item}
  >
    {item.items != null &&
      item.items.map(item =>
        navigationListState.renderItem(item, navigationListState, level + 1)
      )}
  </ch-navigation-list-item>
);

const NAVIGATION_LIST_ITEM = "ch-navigation-list-item";

/**
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "navigation-list-render.scss",
  tag: "ch-navigation-list-render"
})
export class ChNavigationListRender implements ComponentInterface {
  @Element() el!: HTMLChNavigationListRenderElement;

  /**
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"expandableButton"`: Expandable button that allows to expand/collapse
   *     the items of the control.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "action" | "decorative" | "no" =
    "decorative";

  /**
   * Specifies the position of the expandable button in reference of the action
   * element of the items
   *  - `"before"`: Expandable button is placed before the action element.
   *  - `"after"`: Expandable button is placed after the action element.
   */
  @Prop() readonly expandableButtonPosition: "before" | "after" = "before";

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @Prop() readonly expanded: boolean = true;

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly model?: NavigationListModel | undefined;

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly renderItem?: (
    item: NavigationListItem,
    navigationListState: ChNavigationListRender,
    level: number
  ) => any = defaultRender;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented.
   */
  @Event() hyperlinkClick: EventEmitter<PointerEvent>;

  #handleItemClick = (event: PointerEvent) => {
    const composedPath = event.composedPath();

    const itemActionIndex = composedPath.findIndex(
      el =>
        (el as HTMLElement).tagName?.toLowerCase() === "button" ||
        (el as HTMLElement).tagName?.toLowerCase() === "a"
    );

    if (itemActionIndex === -1) {
      return;
    }

    const navigationListItem = composedPath[
      itemActionIndex + 3 // TODO: Use 2 and refactor the implementation
    ] as HTMLChNavigationListItemElement;

    if (
      !navigationListItem ||
      navigationListItem.tagName?.toLowerCase() !== NAVIGATION_LIST_ITEM
    ) {
      return;
    }
    const itemUIModel = navigationListItem.model;

    if (itemUIModel.link) {
      const eventInfo = this.hyperlinkClick.emit(event);

      if (eventInfo.defaultPrevented) {
        event.preventDefault();
        return;
      }
    }
    itemUIModel.expanded = !itemUIModel.expanded;
    forceUpdate(this);
  };

  connectedCallback(): void {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty(
        "getImagePathCallback",
        "ch-accordion-render"
      ) ?? DEFAULT_GET_IMAGE_PATH_CALLBACK;
  }

  render() {
    return (
      <Host onClick={this.#handleItemClick}>
        {(this.model ?? []).map(item => this.renderItem(item, this, 0))}
      </Host>
    );
  }
}
