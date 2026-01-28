import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { repeat } from "lit/directives/repeat.js";

import { IS_SERVER } from "../../development-flags";
import type { ChameleonControlsTagName } from "../../typings/chameleon-components";
import type { ItemLink } from "../../typings/hyperlinks";
import type { GxImageMultiState } from "../../typings/multi-state-images";
import { DEFAULT_NAVIGATION_LIST_GET_IMAGE_PATH_CALLBACK } from "../../utilities/constants/navigation-list";
import {
  getControlRegisterProperty,
  registryControlProperty
} from "../../utilities/register-properties/registry-properties";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import { adoptCommonThemes } from "../../utilities/theme.js";
import {
  removeSubscription,
  subscribe,
  syncStateWithObservableAncestors
} from "../sidebar/expanded-change-observables";
import type {
  NavigationListHyperlinkClickEvent,
  NavigationListItemModel,
  NavigationListModel,
  NavigationListSharedState
} from "./types";
import {
  NAVIGATION_LIST_INITIAL_LEVEL,
  NAVIGATION_LIST_ITEM_WAS_EXPANDED,
  NAVIGATION_LIST_NO_ATTRIBUTE
} from "./utils";

// Side-effect to define the navigation list item
import ChNavigationListItem from "./internal/navigation-list-item/navigation-list-item.lit";

import styles from "./navigation-list-render.scss?inline";

// - - - - - - - - - - - - - - - - - - - -
//                Registry
// - - - - - - - - - - - - - - - - - - - -
// This callback will be registered by default. If it is used in GeneXus, all
// tree views will have the same state, so the parameters used of the treeState
// are "shared" across all tree view instances

// TODO: FOR LIT USE A CONTEXT to share the getImagePathCallback implementation!

// TODO: For some reason, this module import is different when an external
// library imports the registryControlProperty function. We should de-dup this
// to fix issues related with double initialization of the registry
const registerDefaultGetImagePathCallback = () =>
  registryControlProperty(
    "getImagePathCallback",
    "ch-navigation-list-render",
    DEFAULT_NAVIGATION_LIST_GET_IMAGE_PATH_CALLBACK
  );

const isSelectedLink = (
  item: NavigationListItemModel,
  sharedState: NavigationListSharedState
) =>
  !!item.link &&
  !!sharedState.selectedLink?.link?.url &&
  sharedState.selectedLink.link.url === item.link.url &&
  sharedState.selectedLink.id === item.id;

let autoId = 0;
const NAVIGATION_LIST_ITEM =
  "ch-navigation-list-item" satisfies ChameleonControlsTagName;

/**
 * @status experimental
 *
 * This component needs to be hydrated to properly work. If not hydrated, the
 * component visibility will be hidden.
 */
@Component({
  styles,
  tag: "ch-navigation-list-render"
})
export class ChNavigationListRender extends KasstorElement {
  constructor() {
    super();
    // TODO: Conditional add this event
    this.addEventListener("click", this.#handleItemClick);
  }

  @state() protected sharedState!: NavigationListSharedState;

  // TODO: Test how many times this callbacks is triggered on the initial load

  /**
   * This ID is used to identify the Navigation List. Necessary to subscribe
   * for expand/collapse changes in the ancestor nodes.
   */
  #navigationListId: string = `ch-navigation-list-render-${autoId++}`;

  /**
   * This flag help us to avoid hydration mismatches, since the component can
   * have a different expanded value in the server vs the browser, we must
   * perform a second render to set the actual expanded value, because the
   * first render MUST BE done with the initial interface values to avoid
   * hydration mismatches.
   */
  #shouldReRenderAfterFirstRender = false;

  /**
   * If `false` the overflowing content of the control will be clipped to the
   * borders of its container.
   */
  @property({ type: Boolean, attribute: "auto-grow", reflect: true })
  autoGrow: boolean = false;

  /**
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @property({ attribute: "expandable-button" }) expandableButton:
    | "decorative"
    | "no" = "decorative";

  /**
   * Specifies the position of the expandable button in reference of the action
   * element of the items
   *  - `"start"`: Expandable button is placed before the action element.
   *  - `"end"`: Expandable button is placed after the action element.
   */
  @property({ attribute: "expandable-button-position" })
  expandableButtonPosition: "start" | "end" = "start";

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) getImagePathCallback:
    | ((item: NavigationListItemModel) => GxImageMultiState | undefined)
    | undefined;

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @property({ type: Boolean, reflect: true }) expanded: boolean = true;

  /**
   * `true` to expand the path to the selected link when the `selectedLink`
   * property is updated.
   */
  @property({ type: Boolean, attribute: "expand-selected-link" })
  expandSelectedLink: boolean = false;

  /**
   * Specifies the items of the control.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) model:
    | NavigationListModel
    | undefined;
  @Observe("model")
  protected modelChanged() {
    if (this.#mustExpandNewSelectedLink()) {
      this.#expandNewSelectedLink(this.model!);
    }
  }

  /**
   * Specifies the items of the control.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) renderItem:
    | ((
        item: NavigationListItemModel,
        navigationListSharedState: NavigationListSharedState,
        level: number
      ) => TemplateResult)
    | undefined;

  /**
   * Specifies the current selected hyperlink.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) selectedLink?: {
    id?: string;
    link: ItemLink;
  } = {
    link: { url: undefined }
  };
  @Observe("selectedLink")
  protected selectedLinkChanged() {
    if (this.#mustExpandNewSelectedLink()) {
      this.#expandNewSelectedLink(this.model!);
    }
  }

  /**
   * Specifies if the selected item indicator is displayed (only work for hyperlink)
   */
  @property({ type: Boolean, attribute: "selected-link-indicator" })
  selectedLinkIndicator: boolean = false;

  /**
   * Specifies how the caption of the items will be displayed when the control
   * is collapsed
   */
  @property({ attribute: "show-caption-on-collapse" }) showCaptionOnCollapse?:
    | "inline"
    | "tooltip" = "inline";

  /**
   * Specifies the delay (in ms) for the tooltip to be displayed.
   */
  @property({ type: Number, attribute: "tooltip-delay" }) tooltipDelay: number =
    100;

  /**
   * Fired when an button is clicked.
   * This event can be prevented.
   */
  @Event() protected buttonClick!: EventEmitter<NavigationListItemModel>;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented.
   */
  @Event()
  protected hyperlinkClick!: EventEmitter<NavigationListHyperlinkClickEvent>;

  @Observe(
    [
      "expanded",
      "expandableButton",
      "expandableButtonPosition",
      "getImagePathCallback",
      "selectedLinkIndicator",
      "showCaptionOnCollapse",
      "tooltipDelay"
    ],
    { waitUntilFirstUpdate: false }
  )
  protected sharedStateChanged() {
    this.sharedState = {
      expandableButton: this.expandableButton,
      expandableButtonPosition: this.expandableButtonPosition,
      navigationListExpanded: this.expanded,
      getImagePathCallback: this.getImagePathCallback,
      selectedLinkIndicator: this.selectedLinkIndicator,
      selectedLink: this.selectedLink,
      showCaptionOnCollapse: this.showCaptionOnCollapse!,
      tooltipDelay: this.tooltipDelay
    };
  }

  #expandNewSelectedLink = (model: NavigationListModel) => {
    // for let index ... is the fastest for
    for (let index = 0; index < model.length; index++) {
      const itemUIModel = model[index];

      if (isSelectedLink(itemUIModel, this.sharedState)) {
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

  #mustExpandNewSelectedLink = () => this.model && this.expandSelectedLink;

  #handleItemClick = (event: MouseEvent) => {
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
    ] as ChNavigationListItem;

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
      const eventInfo = this.hyperlinkClick.emit({ item: itemUIModel });

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
      // TODO: Add a unit test for this optimization
      itemUIModel[NAVIGATION_LIST_ITEM_WAS_EXPANDED] = true;
      itemUIModel.expanded = !itemUIModel.expanded;
      this.requestUpdate();
    }
  };

  #renderModel = (model: NavigationListModel, level: number) => {
    const actualRender = this.renderItem ?? this.#defaultRender;

    return repeat(
      model ?? [],
      // TODO: Revisit why this triggers an update even if the content of each
      // item doesn't change
      (item, index) => item.id ?? `${level}-${index}`,
      item => actualRender(item, this.sharedState, level)
    );
  };

  // items != null comparison is based on the following benchmark
  // https://www.measurethat.net/Benchmarks/Show/6389/0/compare-comparison-with-null-or-undefined
  #defaultRender = (
    item: NavigationListItemModel,
    sharedState: NavigationListSharedState,
    level: number
  ): TemplateResult | undefined =>
    // TODO: For Lit use a ReactiveController to share the getImagePathCallback implementation?
    // We use nothing to avoid binding undefined properties, so we can skip
    // some checks to improve rendering performance
    html`<ch-navigation-list-item
      id=${item.id ?? nothing}
      .caption=${item.caption}
      .disabled=${item.disabled ?? nothing}
      .expandable=${item.items != null}
      .expanded=${item.expanded ?? nothing}
      .level=${level}
      .link=${item.link ?? nothing}
      .model=${item}
      .selected=${isSelectedLink(item, sharedState)}
      .sharedState=${sharedState}
      .startImgSrc=${item.startImgSrc ?? nothing}
      .startImgType=${item.startImgType ?? nothing}
    >
      ${sharedState.navigationListExpanded &&
      // TODO: Add a unit test for this optimization
      (item[NAVIGATION_LIST_ITEM_WAS_EXPANDED] || item.expanded) &&
      item.items != null
        ? this.#renderModel(item.items, level + 1)
        : nothing}
    </ch-navigation-list-item>`;

  override connectedCallback(): void {
    super.connectedCallback();

    // TODO: Add a unit test for this
    // When used in Astro with ViewTransitions, the connectedCallback can be
    // executed without a shadowRoot attached, because the element is being
    // moved
    if (!this.shadowRoot) {
      return;
    }

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.setAttribute("role", "list");
    this.classList.add(SCROLLABLE_CLASS); // TODO: When the element is moved, are we duplicating this class???
    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);
  }

  // Lit doesn't properly read properties in the connectedCallback when the
  // component is SSRed
  protected override firstWillUpdate(): void {
    this.sharedStateChanged();

    if (this.#mustExpandNewSelectedLink()) {
      this.#expandNewSelectedLink(this.model!);
    }

    // If the getImagePathCallback was not previously registered
    if (
      !getControlRegisterProperty(
        "getImagePathCallback",
        "ch-navigation-list-render"
      )
    ) {
      registerDefaultGetImagePathCallback();
    }

    // The following methods only works in the Browser, so we must not execute
    // them in the server
    if (IS_SERVER) {
      return;
    }

    // Subscribe to expand/collapse changes in the ancestor nodes
    subscribe(this.#navigationListId, {
      getSubscriberRef: () => this,
      observerCallback: expanded => {
        // Since this callback is only executed in the browser, we have to
        // account for hydration mismatches. If there is an hydration mismatch
        // the component won't update its expanded value until the second
        // re-render, because the first render MUST BE done with the initial
        // interface value to avoid hydration mismatches
        const hydrationMismatch =
          this.wasServerSideRendered && this.expanded !== expanded;

        if (hydrationMismatch) {
          this.#shouldReRenderAfterFirstRender = true;
          return;
        }

        this.expanded = expanded;
      }
    });

    // Initialize the state
    syncStateWithObservableAncestors(this.#navigationListId);
  }

  protected override firstUpdated(): void {
    this.wasServerSideRendered = false;

    if (this.#shouldReRenderAfterFirstRender) {
      this.#shouldReRenderAfterFirstRender = false;

      // We can now safely sync the interface with the actual values, since the
      // hydration process has been completed.
      syncStateWithObservableAncestors(this.#navigationListId);
    }

    // Make visible the component after the update has been completed. If a
    // second re-render is queued before executing this callback, the
    // updateComplete is resolved after the second render.
    this.updateComplete.then(() => this.classList.add("ch-hydrated"));
  }

  override disconnectedCallback(): void {
    removeSubscription(this.#navigationListId);
    super.disconnectedCallback();
  }

  protected override render() {
    return this.model == null
      ? nothing
      : this.#renderModel(this.model, NAVIGATION_LIST_INITIAL_LEVEL);
  }
}

export default ChNavigationListRender;

declare global {
  interface HTMLElementTagNameMap {
    "ch-navigation-list-render": ChNavigationListRender;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChNavigationListRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChNavigationListRenderElement;
  }

  /** Type of the `ch-navigation-list-render`'s `buttonClick` event. */
  // prettier-ignore
  type HTMLChNavigationListRenderElementButtonClickEvent = HTMLChNavigationListRenderElementCustomEvent<
    HTMLChNavigationListRenderElementEventMap["buttonClick"]
  >;

  /** Type of the `ch-navigation-list-render`'s `hyperlinkClick` event. */
  // prettier-ignore
  type HTMLChNavigationListRenderElementHyperlinkClickEvent = HTMLChNavigationListRenderElementCustomEvent<
    HTMLChNavigationListRenderElementEventMap["hyperlinkClick"]
  >;

  interface HTMLChNavigationListRenderElementEventMap {
    buttonClick: NavigationListItemModel;
    hyperlinkClick: NavigationListHyperlinkClickEvent;
  }

  interface HTMLChNavigationListRenderElementEventTypes {
    buttonClick: HTMLChNavigationListRenderElementButtonClickEvent;
    hyperlinkClick: HTMLChNavigationListRenderElementHyperlinkClickEvent;
  }

  /**
   * @status experimental
   *
   * This component needs to be hydrated to properly work. If not hydrated, the
   * component visibility will be hidden.
   *
   * @fires buttonClick Fired when an button is clicked.
   *   This event can be prevented.
   * @fires hyperlinkClick Fired when an hyperlink is clicked.
   *   This event can be prevented.
   */
  // prettier-ignore
  interface HTMLChNavigationListRenderElement extends ChNavigationListRender {
    // Extend the ChNavigationListRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChNavigationListRenderElementEventTypes>(type: K, listener: (this: HTMLChNavigationListRenderElement, ev: HTMLChNavigationListRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChNavigationListRenderElementEventTypes>(type: K, listener: (this: HTMLChNavigationListRenderElement, ev: HTMLChNavigationListRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-navigation-list-render": HTMLChNavigationListRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-navigation-list-render": HTMLChNavigationListRenderElement;
  }
}

