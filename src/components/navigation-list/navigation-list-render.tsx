import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";

import { GxImageMultiState, ItemLink } from "../../common/types";
import {
  NavigationListHyperlinkClickEvent,
  NavigationListItemModel,
  NavigationListModel
} from "./types";

import {
  getControlRegisterProperty,
  registryControlProperty
} from "../../common/registry-properties";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";
import { formatImagePath } from "../../common/utils";
import {
  removeSubscription,
  subscribe,
  syncStateWithObservableAncestors
} from "../sidebar/expanded-change-obervables";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";
import { NAVIGATION_LIST_INITIAL_LEVEL } from "./utils";

// - - - - - - - - - - - - - - - - - - - -
//                Registry
// - - - - - - - - - - - - - - - - - - - -
// This callback will be registered by default. If it is used in GeneXus, all
// tree views will have the same state, so the parameters used of the treeState
// are "shared" across all tree view instances

// TODO: For some reason, this module import is different when an external
// library imports the registryControlProperty function. We should de-dup this
// to fix issues related with double initialization of the registry
const registerDefaultGetImagePathCallback = (
  navigationListState: ChNavigationListRender
) =>
  registryControlProperty(
    "getImagePathCallback",
    "ch-navigation-list-render",
    (item: NavigationListItemModel) => ({
      base: formatImagePath(
        navigationListState.useGxRender
          ? fromGxImageToURL(
              item.startImgSrc,
              navigationListState.gxSettings,
              navigationListState.gxImageConstructor
            )
          : item.startImgSrc,
        item.startImgType
      )
    })
  );

const isSelectedLink = (
  item: NavigationListItemModel,
  navigationListState: ChNavigationListRender
) =>
  !!item.link &&
  !!navigationListState.selectedLink?.link?.url &&
  navigationListState.selectedLink.link.url === item.link.url &&
  navigationListState.selectedLink.id === item.id;

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
    selected={isSelectedLink(item, navigationListState)}
    selectedLinkIndicator={navigationListState.selectedLinkIndicator}
    showCaptionOnCollapse={navigationListState.showCaptionOnCollapse}
    startImgSrc={item.startImgSrc}
    startImgType={item.startImgType}
    tooltipDelay={navigationListState.tooltipDelay}
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

let autoId = 0;
const NAVIGATION_LIST_ITEM = "ch-navigation-list-item";

/**
 * The `ch-navigation-list-render` component renders a hierarchical navigation menu composed of expandable items that can act as hyperlinks or buttons.
 *
 * @remarks
 * ## Features
 *  - Nested items supported to any depth, each with optional start image, caption, and expandable indicator.
 *  - Automatic synchronization with ancestor `ch-sidebar` expand/collapse events.
 *  - Auto-expand ancestors of the selected link when `expandSelectedLink` is enabled.
 *  - Configurable expandable button style (`decorative` or `no`) and position (`start` or `end`).
 *  - Selected link indicator for hyperlink items.
 *  - Caption display on collapse via inline text or tooltip.
 *  - Custom item rendering through the `renderItem` callback.
 *
 * ## Use when
 *  - Building primary or secondary navigation menus inside a sidebar, dashboard shell, or settings page.
 *  - Primary or secondary sidebar navigation that changes what is rendered in the main content area.
 *  - Indicating the user's current location within the application.
 *
 * ## Do not use when
 *  - Displaying flat, non-hierarchical link lists -- a simple `<ul>` would suffice.
 *  - Displaying tree-structured data that requires checkboxes, drag-and-drop, or inline editing -- prefer `ch-tree-view-render` instead.
 *  - Displaying hierarchical data structures like file trees — prefer `ch-tree-view-render`.
 *  - Contextual actions on items — prefer `ch-action-list-render` or `ch-action-menu-render`.
 *  - Navigation depth regularly exceeds 2 levels — consider a `ch-tree-view-render` or separate pages.
 *
 * ## Accessibility
 *  - The host element has `role="list"`.
 *  - Expandable items use disclosure semantics so assistive technology can convey hierarchy.
 *
 * @part item__action - The clickable row element for each navigation item. Receives position, state, and level parts.
 * @part item__button - A `<button>`-type navigation item row.
 * @part item__link - An `<a>`-type navigation item row.
 * @part item__caption - The text caption inside the navigation item.
 * @part item__group - The container for an item's nested children.
 *
 * @part indicator - The visual selection indicator shown for the active item. Rendered when `selectedLinkIndicator` is `true` and the item is selected.
 * @part expand-button - Present in the `item__action` part when the item has an expandable button.
 *
 * @part disabled - Present in the `item__action`, `item__caption`, `item__group`, and `indicator` parts when the item is disabled.
 * @part expanded - Present in the `item__action` and `item__group` parts when the item is expanded.
 * @part collapsed - Present in the `item__action` and `item__group` parts when the item is collapsed.
 * @part selected - Present in the `item__caption`, `item__group`, and `item__link` parts when the item is selected.
 * @part not-selected - Present in the `item__caption`, `item__group`, and `item__link` parts when the item is not selected.
 * @part navigation-list-collapsed - Present in the `item__action` and `item__caption` parts when the parent `ch-sidebar` is collapsed.
 * @part tooltip - Present in the `item__caption` part to style the tooltip that appears when the sidebar is collapsed.
 * @part even-level - Present in the `item__action` and `item__group` parts when the item is at an even nesting level.
 * @part odd-level - Present in the `item__action` and `item__group` parts when the item is at an odd nesting level.
 *
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "navigation-list-render.scss",
  tag: "ch-navigation-list-render"
})
export class ChNavigationListRender implements ComponentInterface {
  /**
   * This ID is used to identify the Navigation List. Necessary to subscribe
   * for expand/collapse changes in the ancestor nodes.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #navigationListId: string;

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
   *  - `"start"`: Expandable button is placed before the action element.
   *  - `"end"`: Expandable button is placed after the action element.
   */
  @Prop() readonly expandableButtonPosition: "start" | "end" = "start";

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
  @Prop({ mutable: true }) expanded: boolean = true;

  /**
   * `true` to expand the path to the selected link when the `selectedLink`
   * property is updated.
   */
  @Prop() readonly expandSelectedLink: boolean = false;

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
  @Watch("model")
  modelChanged() {
    if (this.model && this.expandSelectedLink) {
      this.#expandNewSelectedLink(this.model);
    }
  }

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
  @Watch("selectedLink")
  selectedLinkChanged() {
    if (this.model && this.expandSelectedLink) {
      this.#expandNewSelectedLink(this.model);
    }
  }

  /**
   * Specifies if the selected item indicator is displayed (only work for hyperlink)
   */
  @Prop() readonly selectedLinkIndicator: boolean = false;

  /**
   * Specifies how the caption of the items will be displayed when the control
   * is collapsed
   */
  @Prop() readonly showCaptionOnCollapse?: "inline" | "tooltip" = "inline";

  /**
   * Specifies the delay (in ms) for the tooltip to be displayed.
   */
  @Prop() readonly tooltipDelay?: number = 100;

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
  @Event() hyperlinkClick: EventEmitter<NavigationListHyperlinkClickEvent>;

  #expandNewSelectedLink = (model: NavigationListModel) => {
    // for let index ... is the fastest for
    for (let index = 0; index < model.length; index++) {
      const itemUIModel = model[index];

      if (isSelectedLink(itemUIModel, this)) {
        itemUIModel.expanded = true;
        return true;
      }

      if (itemUIModel.items != null) {
        const selectedLinkIsChild = this.#expandNewSelectedLink(
          itemUIModel.items
        );

        if (selectedLinkIsChild) {
          itemUIModel.expanded = true;
          return true;
        }
      }
    }

    return false;
  };

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
    const canExpandSubItems = this.expanded;

    if (itemUIModel.link) {
      const eventInfo = this.hyperlinkClick.emit({ event, item: itemUIModel });

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

    // TODO: Add an unit test for this
    if (canExpandSubItems && itemUIModel.items != null) {
      itemUIModel.expanded = !itemUIModel.expanded;
      forceUpdate(this);
    }
  };

  connectedCallback(): void {
    this.#navigationListId ??= `ch-navigation-list-render-${autoId++}`;

    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);

    // If the getImagePathCallback was not previously registered
    if (
      !getControlRegisterProperty(
        "getImagePathCallback",
        "ch-navigation-list-render"
      )
    ) {
      registerDefaultGetImagePathCallback(this);
    }

    if (this.model && this.expandSelectedLink) {
      this.#expandNewSelectedLink(this.model);
    }

    // Subscribe to expand/collapse changes in the ancestor nodes
    subscribe(this.#navigationListId, {
      getSubscriberRef: () => this.el,
      observerCallback: expanded => {
        this.expanded = expanded;
      }
    });

    // Initialize the state
    syncStateWithObservableAncestors(this.#navigationListId);

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.el.setAttribute("role", "list");
  }

  disconnectedCallback(): void {
    removeSubscription(this.#navigationListId);
  }

  render() {
    return (
      <Host
        class={{
          [SCROLLABLE_CLASS]: true,
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
