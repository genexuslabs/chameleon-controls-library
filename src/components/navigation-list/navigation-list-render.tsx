import { Component, ComponentInterface, Host, Prop, h } from "@stencil/core";

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
  navigationListState: ChNavigationListRender
) => (
  <ch-navigation-list-item
    id={item.id}
    caption={item.caption}
    expandable={item.items != null}
    expanded={item.expanded}
  >
    {item.items != null &&
      item.items.map(item =>
        navigationListState.renderItem(item, navigationListState)
      )}
  </ch-navigation-list-item>
);

/**
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "navigation-list-render.scss",
  tag: "ch-navigation-list-render"
})
export class ChNavigationListRender implements ComponentInterface {
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
    navigationListState: ChNavigationListRender
  ) => any = defaultRender;

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
      <Host>{(this.model ?? []).map(item => this.renderItem(item, this))}</Host>
    );
  }
}
