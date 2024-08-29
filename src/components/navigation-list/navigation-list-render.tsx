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

import { GxImageMultiState, ItemLink } from "../../common/types";
import {
  getControlRegisterProperty,
  registryControlProperty
} from "../../common/registry-properties";
import { NavigationListItemModel, NavigationListModel } from "./types";
import { NAVIGATION_LIST_INITIAL_LEVEL } from "./utils";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";

// - - - - - - - - - - - - - - - - - - - -
//                Registry
// - - - - - - - - - - - - - - - - - - - -
// This callback will be registered by default. If it is used in GeneXus, all
// tree views will have the same state, so the parameters used of the treeState
// are "shared" across all tree view instances
const registerDefaultGetImagePathCallback = (
  navigationListState: ChNavigationListRender
) =>
  registryControlProperty(
    "getImagePathCallback",
    "ch-navigation-list-render",
    (item: NavigationListItemModel) => ({
      base: navigationListState.useGxRender
        ? fromGxImageToURL(
            item.startImgSrc,
            navigationListState.gxSettings,
            navigationListState.gxImageConstructor
          )
        : item.startImgSrc
    })
  );

// items != null comparison is based on the following benchmark
// https://www.measurethat.net/Benchmarks/Show/6389/0/compare-comparison-with-null-or-undefined
const defaultRender = (
  item: NavigationListItemModel,
  navigationListState: ChNavigationListRender,
  level: number,
  index: number
) => (
  <ch-navigation-list-item
    key={item.id ?? `${level}-${index}`}
    id={item.id}
    caption={item.caption}
    disabled={item.disabled}
    expandable={item.items != null}
    expandableButton={navigationListState.expandableButton}
    expandableButtonPosition={navigationListState.expandableButtonPosition}
    expanded={item.expanded}
    level={level}
    link={item.link}
    model={item}
    navigationListExpanded={navigationListState.expanded}
    selected={
      !!item.link &&
      navigationListState.selectedLink.link.url === item.link.url &&
      navigationListState.selectedLink.id === item.id
    }
    selectedItemIndicator={navigationListState.selectedItemIndicator}
    showCaptionOnCollapse={navigationListState.showCaptionOnCollapse}
    startImgSrc={item.startImgSrc}
    startImgType={item.startImgType}
  >
    {navigationListState.expanded &&
      item.items != null &&
      item.items.map((item, subItemIndex) =>
        navigationListState.renderItem(
          item,
          navigationListState,
          level + 1,
          subItemIndex
        )
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
   * If `false` the overflowing content of the control will be clipped to the
   * borders of its container.
   */
  @Prop() readonly autoGrow: boolean = false;

  /**
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "decorative" | "no" = "decorative";

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
    item: NavigationListItemModel
  ) => GxImageMultiState | undefined;

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @Prop() readonly expanded: boolean = true;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings: any;

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly model?: NavigationListModel | undefined;

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly renderItem?: (
    item: NavigationListItemModel,
    navigationListState: ChNavigationListRender,
    level: number,
    index: number
  ) => any = defaultRender;

  /**
   * Specifies the current selected hyperlink.
   */
  @Prop({ mutable: true }) selectedLink?: { id?: string; link: ItemLink } = {
    link: { url: undefined }
  };

  /**
   * Specifies if the selected item indicator is displayed (only work for hyperlink)
   */
  @Prop() readonly selectedItemIndicator: boolean = false;

  /**
   * Specifies how the caption of the items will be displayed when the control
   * is collapsed
   */
  @Prop() readonly showCaptionOnCollapse?: "inline" | "tooltip" = "inline";

  /**
   * This property is a WA to implement the Navigation List as a UC 2.0 in
   * GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  /**
   * Fired when an button is clicked.
   * This event can be prevented.
   */
  @Event() buttonClick: EventEmitter<NavigationListItemModel>;

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
      itemActionIndex + 2
    ] as HTMLChNavigationListItemElement;

    // Get the navigation list item of the event
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

      // Update the selected link
      this.selectedLink = { id: itemUIModel.id, link: itemUIModel.link };
    } else {
      const eventInfo = this.buttonClick.emit(itemUIModel);

      if (eventInfo.defaultPrevented) {
        event.preventDefault();
        return;
      }
    }

    if (itemUIModel.items != null) {
      itemUIModel.expanded = !itemUIModel.expanded;
      forceUpdate(this);
    }
  };

  connectedCallback(): void {
    // If the getImagePathCallback was not previously registered
    if (
      !getControlRegisterProperty(
        "getImagePathCallback",
        "ch-navigation-list-render"
      )
    ) {
      registerDefaultGetImagePathCallback(this);
    }

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.el.setAttribute("role", "list");
  }

  render() {
    return (
      <Host
        class={{
          "ch-navigation-list--collapsed": !this.expanded,
          "ch-navigation-list--contain": !this.autoGrow
        }}
        onClick={this.#handleItemClick}
      >
        {this.model?.map((item, index) =>
          this.renderItem(item, this, NAVIGATION_LIST_INITIAL_LEVEL, index)
        )}
      </Host>
    );
  }
}
