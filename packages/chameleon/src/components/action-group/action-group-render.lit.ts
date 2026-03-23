import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";

import type { ActionGroupDisplayedMarkers, ActionGroupModel, ItemsOverflowBehavior } from "./types";
// import { fromGxImageToURL } from "../tree-view/genexus-implementation";

import { IS_SERVER } from "../../development-flags";
import { Host } from "../../utilities/host/host";
import { ACTION_MENU_ITEM_EXPORT_PARTS } from "../../utilities/reserved-names/parts/action-menu";
import { SyncWithRAF } from "../../utilities/sync-with-frames";
import type { ActionMenuImagePathCallback } from "../action-menu/types";
import type { ChPopoverAlign } from "../popover/types";
import { MARKER_CLASS_SELECTOR, renderItems } from "./renders";

import styles from "./action-group-render.scss?inline";

// In the server we need to preload the ch-action-menu-render and ch-popover
// just in case to properly render them, because Lit doesn't support async
// rendering in the server.
if (IS_SERVER) {
  await import("../action-menu/action-menu-render.lit");
  await import("../popover/popover.lit");
}

// const FLOATING_POINT_ERROR = 1;

const INTERSECTION_OPTIONS: IntersectionObserverInit = { threshold: 1 };

/**
 * The `ch-action-group-render` component displays a horizontal group of actionable items that adapts to the available space by collapsing overflowing items into a "more actions" dropdown menu.
 *
 * @remarks
 * ## Features
 *  - Three overflow strategies: horizontal scroll, multiline wrap, or responsive collapse into a dropdown.
 *  - Responsive-collapse mode uses `IntersectionObserver` to detect hidden items in real time.
 *  - Overflow dropdown powered by `ch-action-menu-render`.
 *  - Supports custom slot content that is forwarded into the overflow menu when collapsed.
 *
 * ## Use when
 *  - You have a dynamic set of toolbar-style actions that must remain usable at every viewport width.
 *  - Building command bars or toolbars that need graceful degradation on smaller screens.
 *  - Toolbars or command bars with a variable number of actions that must adapt to available space.
 *
 * ## Do not use when
 *  - The actions do not need responsive overflow handling -- prefer a plain list or `ch-action-menu-render` instead.
 *  - All actions should always be visible — use individual buttons or `ch-action-list-render` instead.
 *
 * ## Accessibility
 *  - The host element has `role="list"`, and the overflow menu item has `role="listitem"`.
 *  - The "more actions" button carries a configurable `aria-label` (`moreActionsAccessibleName`).
 *  - The component delegates click, keyboard, and expanded-change events to
 *    its embedded `ch-action-menu-render` for the overflow dropdown.
 *
 * @part separator - A horizontal divider rendered for items of `type: "separator"`. Also receives the item's `id` and custom `parts` if defined.
 * @part vertical - Present on `separator` items.
 *
 * @status experimental
 *
 * @slot {name} - Named slots matching each item of `type: "slot"` in the model. These slots allow projecting custom content for individual action items and are forwarded into the overflow menu when the item collapses.
 */
@Component({
  styles,
  tag: "ch-action-group-render"
})
export class ChActionGroupRender extends KasstorElement {
  #collapsedModel: ActionGroupModel = [];
  #isResponsiveCollapse = false;
  #shouldCheckResponsiveCollapseWatcher = true;

  // Responsive collapse variables
  #displayedMarkers: ActionGroupDisplayedMarkers[] | undefined;
  #responsiveActionsWatcher: IntersectionObserver | undefined;
  #updateActionsRAF: SyncWithRAF | undefined; // Don't allocate memory until needed when dragging

  /**
   * 0 means no collapsed items. 1 means the first items is collapsed. And so
   * on.
   */
  @state() protected collapsedItems = 0;
  @Observe("collapsedItems")
  protected collapsedItemsChanged() {
    this.#setModels();
  }

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc or endImgSrc (of an item) needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback: ActionMenuImagePathCallback | undefined;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ attribute: false }) gxImageConstructor: ((name: string) => any) | undefined;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ attribute: false }) gxSettings: any;

  /**
   * This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed
   * to make the control responsive to changes in the width of the container of ActionGroup.
   *
   * | Value                 | Details                                                                                          |
   * | --------------------- | ------------------------------------------------------------------------------------------------ |
   * | `add-scroll`          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |
   * | `multiline`           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |
   * | `responsive-collapse` | The Action Group items, when they start to overflow the control, are placed in the More Actions. |
   */
  @property({ reflect: true, attribute: "items-overflow-behavior" })
  itemsOverflowBehavior: ItemsOverflowBehavior = "responsive-collapse";
  @Observe("itemsOverflowBehavior")
  protected itemsOverflowBehaviorChanged() {
    this.#shouldCheckResponsiveCollapseWatcher = true;
    this.#isResponsiveCollapse = this.itemsOverflowBehavior === "responsive-collapse";

    this.#disconnectActionsObserver();
    this.#removeOrInitializeMarkersVisibility();
  }

  /**
   * This property lets you define the model of the ch-action-group control.
   */
  @property({ attribute: false }) model: ActionGroupModel | undefined;
  @Observe("model")
  protected modelChanged() {
    this.#shouldCheckResponsiveCollapseWatcher = true;

    this.#disconnectActionsObserver();
    this.#removeOrInitializeMarkersVisibility();
    this.#setModels();
  }

  /**
   * This property lets you specify the label for the more actions button.
   * Important for accessibility.
   */
  @property({ attribute: "more-actions-accessible-name" })
  moreActionsAccessibleName: string = "Show more actions";

  /**
   * Specifies the block alignment of the more actions dropdown that is
   * placed relative to the "more actions" button.
   */
  @property({ attribute: "more-actions-block-align" })
  moreActionsBlockAlign: ChPopoverAlign = "outside-end";

  /**
   * This attribute lets you specify the caption for the more actions button.
   */
  @property({ attribute: "more-actions-caption" })
  moreActionsCaption: string | undefined;

  /**
   * Specifies the inline alignment of the more actions dropdown that is
   * placed relative to the "more actions" button.
   */
  @property({ attribute: "more-actions-inline-align" })
  moreActionsInlineAlign: ChPopoverAlign = "inside-start";

  // /**
  //  * Determine if the dropdown section should be opened when the expandable
  //  * button of the control is focused.
  //  * TODO: Add implementation
  //  */
  // @property({ type: Boolean, attribute: "open-on-focus" })
  // openOnFocus: boolean = false;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ type: Boolean, attribute: "use-gx-render" })
  useGxRender: boolean = false;

  // TODO: Use the getImagePath for resolving the images
  // #getImagePath = (img: string) =>
  //   this.useGxRender
  //     ? fromGxImageToURL(img, this.gxSettings, this.gxImageConstructor)
  //     : img;

  #removeOrInitializeMarkersVisibility = () => {
    this.#displayedMarkers = this.#isResponsiveCollapse
      ? (this.model?.map((_, index) => ({
          id: index.toString(),
          displayed: true
        })) ?? [])
      : undefined;
  };

  #setModels = () => {
    this.#collapsedModel = [];

    if (this.model && this.collapsedItems > 0) {
      this.#collapsedModel = this.model.slice(this.model.length - this.collapsedItems);
    }
  };

  // - - - - - - - - - - - - - - - - - - - -
  //                Observers
  // - - - - - - - - - - - - - - - - - - - -
  #setResponsiveCollapse = () => {
    if (this.#isResponsiveCollapse) {
      this.#connectActionsObserver();
    }
  };

  #connectActionsObserver = () => {
    this.#updateActionsRAF ??= new SyncWithRAF();
    this.#responsiveActionsWatcher ??= new IntersectionObserver(entries => {
      // Update the visibility of each entry
      entries.forEach(entry => {
        const itemId = Number(entry.target.id);

        if (this.model![itemId].type === "slot") {
          this.#displayedMarkers![itemId].size = `${
            (entry.target as HTMLSlotElement).offsetWidth
          }px`;
        }

        this.#displayedMarkers![itemId].displayed = entry.isIntersecting;
      });

      // Queue a task to update the displayed actions in the next frame
      this.#updateActionsRAF!.perform(this.#updateDisplayedActions);
    }, INTERSECTION_OPTIONS);

    // Observe the actions
    this.shadowRoot!.querySelectorAll(MARKER_CLASS_SELECTOR).forEach(action =>
      this.#responsiveActionsWatcher!.observe(action)
    );
  };

  /**
   * Update the visibility of the actions.
   * Only works if itemsOverflowBehavior === "responsive-collapse"
   */
  #updateDisplayedActions = () => {
    const firstItemIndexThatIsNotVisible = this.#displayedMarkers!.findIndex(
      markerIsDisplayed => !markerIsDisplayed.displayed
    );

    // All items are visible
    if (firstItemIndexThatIsNotVisible === -1) {
      this.collapsedItems = 0;
    }
    // There are hidden items
    else {
      this.collapsedItems = this.model!.length - firstItemIndexThatIsNotVisible;
    }
  };

  #disconnectActionsObserver = () => {
    this.#updateActionsRAF?.cancel();
    this.#updateActionsRAF = undefined;

    this.#responsiveActionsWatcher?.disconnect();
    this.#responsiveActionsWatcher = undefined;
  };

  override connectedCallback() {
    super.connectedCallback();

    // TODO: Use role="menu"
    this.setAttribute("role", "list");

    this.collapsedItems = 0;
    this.#isResponsiveCollapse = this.itemsOverflowBehavior === "responsive-collapse";

    this.#removeOrInitializeMarkersVisibility();
    this.#setModels();
  }

  protected override updated() {
    if (this.#shouldCheckResponsiveCollapseWatcher) {
      this.#shouldCheckResponsiveCollapseWatcher = false;
      this.#setResponsiveCollapse();
    }
  }

  override disconnectedCallback() {
    this.#disconnectActionsObserver();
    super.disconnectedCallback();
  }

  override render() {
    if (!this.model || this.model.length === 0) {
      return nothing;
    }

    Host(this, {});

    return html`${this.#isResponsiveCollapse && this.collapsedItems !== 0
      ? html`<ch-action-menu-render
          role="listitem"
          exportparts=${ACTION_MENU_ITEM_EXPORT_PARTS}
          .blockAlign=${this.moreActionsBlockAlign}
          .buttonAccessibleName=${this.moreActionsAccessibleName}
          .disabled=${this.disabled}
          .getImagePathCallback=${this.getImagePathCallback}
          .inlineAlign=${this.moreActionsInlineAlign}
          .model=${this.#collapsedModel}
        >
          ${this.moreActionsCaption}
          ${this.#collapsedModel.map(item =>
            item.type === "slot" ? html`<slot slot=${item.id} name=${item.id}></slot>` : nothing
          )}
        </ch-action-menu-render>`
      : nothing}
    ${renderItems(
      this.model,
      this.#isResponsiveCollapse,
      this.#displayedMarkers,
      this.disabled,
      this.getImagePathCallback
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-action-group-render": ChActionGroupRender;
  }
}


// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChActionGroupRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChActionGroupRenderElement;
  }

  /**
   * The `ch-action-group-render` component displays a horizontal group of actionable items that adapts to the available space by collapsing overflowing items into a "more actions" dropdown menu.
   *
   * @remarks
   * ## Features
   *  - Three overflow strategies: horizontal scroll, multiline wrap, or responsive collapse into a dropdown.
   *  - Responsive-collapse mode uses `IntersectionObserver` to detect hidden items in real time.
   *  - Overflow dropdown powered by `ch-action-menu-render`.
   *  - Supports custom slot content that is forwarded into the overflow menu when collapsed.
   *
   * ## Use when
   *  - You have a dynamic set of toolbar-style actions that must remain usable at every viewport width.
   *  - Building command bars or toolbars that need graceful degradation on smaller screens.
   *  - Toolbars or command bars with a variable number of actions that must adapt to available space.
   *
   * ## Do not use when
   *  - The actions do not need responsive overflow handling -- prefer a plain list or `ch-action-menu-render` instead.
   *  - All actions should always be visible — use individual buttons or `ch-action-list-render` instead.
   *
   * ## Accessibility
   *  - The host element has `role="list"`, and the overflow menu item has `role="listitem"`.
   *  - The "more actions" button carries a configurable `aria-label` (`moreActionsAccessibleName`).
   *  - The component delegates click, keyboard, and expanded-change events to
   *    its embedded `ch-action-menu-render` for the overflow dropdown.
   *
   * @part separator - A horizontal divider rendered for items of `type: "separator"`. Also receives the item's `id` and custom `parts` if defined.
   * @part vertical - Present on `separator` items.
   *
   * @status experimental
   *
   * @slot {name} - Named slots matching each item of `type: "slot"` in the model. These slots allow projecting custom content for individual action items and are forwarded into the overflow menu when the item collapses.
   */// prettier-ignore
  interface HTMLChActionGroupRenderElement extends ChActionGroupRender {
    // Extend the ChActionGroupRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-action-group-render": HTMLChActionGroupRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-action-group-render": HTMLChActionGroupRenderElement;
  }
}

