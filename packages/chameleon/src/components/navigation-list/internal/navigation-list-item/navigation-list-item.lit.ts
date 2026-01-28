import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

import { IS_SERVER } from "../../../../development-flags";
import type { ItemLink } from "../../../../typings/hyperlinks";
import type { ImageRender } from "../../../../typings/multi-state-images";
import { tokenMap } from "../../../../utilities/mapping/token-map";
import { tokenMapExportParts } from "../../../../utilities/mapping/token-map-export-parts";
import { getControlRegisterProperty } from "../../../../utilities/register-properties/registry-properties";
import { DISABLED_CLASS } from "../../../../utilities/reserved-names/common";
import {
  NAVIGATION_LIST_ITEM_EXPORT_PARTS,
  NAVIGATION_LIST_ITEM_PARTS_DICTIONARY
} from "../../../../utilities/reserved-names/parts/navigation-list";
import type ChNavigationListRender from "../../navigation-list-render.lit";
import type {
  NavigationListItemModel,
  NavigationListSharedState
} from "../../types";
import {
  NAVIGATION_LIST_INITIAL_LEVEL,
  NAVIGATION_LIST_NO_ATTRIBUTE
} from "../../utils";
import { getNavigationListItemLevelPart } from "./utils";

import styles from "./navigation-list-item.scss?inline";

// In the server we need to preload the ch-image just in case to properly
// render it, because Lit doesn't support async rendering in the server.
// In the client we can lazy load the ch-image, since not all ch-checkbox will
// use an icon
if (IS_SERVER) {
  await import("../../../image/image.lit");
}

let GET_IMAGE_PATH_CALLBACK_REGISTRY: ChNavigationListRender["getImagePathCallback"];

/**
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-navigation-list-item"
})
export class ChNavigationListItem extends KasstorElement {
  /**
   * Specifies the caption of the control
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) caption: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) disabled: boolean | undefined;

  /**
   * Specifies if the control contains sub items.
   */
  @property({ type: Boolean, reflect: true }) expandable: boolean = false;

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @property({ type: Boolean, reflect: true }) expanded: boolean | undefined;

  /**
   * This property works the same as the exportparts attribute. It is defined
   * as a property just to reflect the default value, which avoids FOUC when
   * the `ch-navigation-list-render` component is Server Side Rendered.
   * Otherwise, setting this attribute on the client would provoke FOUC and/or
   * visual flickering.
   */
  @property({ reflect: true }) exportparts: string =
    NAVIGATION_LIST_ITEM_EXPORT_PARTS;

  /**
   * Specifies at which level of the navigation list is rendered the control.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) level: number =
    NAVIGATION_LIST_INITIAL_LEVEL;

  /**
   *
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) link: ItemLink | undefined;

  /**
   * Specifies the UI model of the control
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) model!: NavigationListItemModel;

  /**
   * Specifies if the hyperlink is selected. Only applies when the `link`
   * property is defined.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) selected?: boolean = false;

  @property(NAVIGATION_LIST_NO_ATTRIBUTE)
  sharedState!: NavigationListSharedState;

  /**
   * Specifies the src of the start image.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) startImgSrc: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @property(NAVIGATION_LIST_NO_ATTRIBUTE) startImgType:
    | Exclude<ImageRender, "img">
    | undefined;

  #renderCaption = (navigationListCollapsed: boolean, levelParts: string) => {
    return navigationListCollapsed &&
      this.sharedState.showCaptionOnCollapse === "tooltip"
      ? html`<ch-tooltip
          .actionElement=${
            // We can't use this because in not a focusable element. Non
            // focusable elements generate issue with the "mouseleave" and
            // "focusout" events
            null
          }
          .actionElementAccessibleName=${this.caption}
          block-align="center"
          inline-align="outside-end"
          .delay=${this.sharedState.tooltipDelay}
          exportparts=${tokenMapExportParts(
            {
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.CAPTION]: true,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]: true,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.TOOLTIP]: true,

              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
                !this.selected,

              [levelParts]: true
            },
            "window"
          )}
          >${this.caption}</ch-tooltip
        >`
      : html`<span
          class="caption"
          part=${tokenMap({
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.CAPTION]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
              navigationListCollapsed,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              !this.selected,

            [levelParts]: true
          })}
          >${this.caption}</span
        >`;
  };

  #renderImage = () =>
    this.startImgSrc
      ? html`<ch-image
          .disabled=${this.disabled}
          .getImagePathCallback=${this.sharedState.getImagePathCallback ??
          GET_IMAGE_PATH_CALLBACK_REGISTRY}
          .src=${this.model}
          .type=${this.startImgType ?? nothing}
        ></ch-image>`
      : nothing;

  #renderContent = (
    levelParts: string,
    hasExpandableButton: boolean,
    expandableButtonPosition: "start" | "end",
    isInitialLevel: boolean
  ): TemplateResult => {
    const navigationListCollapsed = !this.sharedState.navigationListExpanded;
    const disabled = this.disabled;

    // Classes
    const classes = {
      action: true,
      "action--navigation-list-collapsed": navigationListCollapsed,

      [DISABLED_CLASS]: !!disabled,

      [`expandable-button ${this.expanded ? "expanded" : "collapsed"} expandable-button--${expandableButtonPosition}`]:
        hasExpandableButton
    };

    // We heavily use nothing to avoid bindings to improve rendering performance
    return this.link
      ? html`<a
          role=${disabled ? "link" : nothing}
          aria-current=${this.selected ? "page" : nothing}
          aria-disabled=${disabled ? "true" : nothing}
          class=${tokenMap(classes)}
          style=${isInitialLevel ? nothing : `--level: ${this.level}`}
          part=${tokenMap({
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.LINK]: true,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: !!this.selected,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              !this.selected,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
              hasExpandableButton,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
              hasExpandableButton && expandableButtonPosition === "start",
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
              hasExpandableButton && expandableButtonPosition === "end",

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
              navigationListCollapsed,

            [levelParts]: true
          })}
          href=${(!disabled && this.link.url) || nothing}
          rel=${
            // TODO: Add unit tests for this
            (!disabled && this.link.rel) || nothing
          }
          target=${
            // TODO: Add unit tests for this
            (!disabled && this.link.target) || nothing
          }
        >
          ${this.#renderImage()}
          ${this.#renderCaption(navigationListCollapsed, levelParts)}
        </a>`
      : html`<button
          class=${tokenMap(classes)}
          style=${isInitialLevel ? nothing : `--level: ${this.level}`}
          part=${tokenMap({
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.BUTTON]: true,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
              hasExpandableButton,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
              hasExpandableButton && expandableButtonPosition === "start",
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
              hasExpandableButton && expandableButtonPosition === "end",

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
              navigationListCollapsed,

            [levelParts]: true
          })}
          ?disabled=${disabled}
          type="button"
        >
          ${this.#renderImage()}
          ${this.#renderCaption(navigationListCollapsed, levelParts)}
        </button>`;
  };

  // Lit doesn't properly read properties in the connectedCallback when the
  // component is SSRed
  protected override firstWillUpdate(): void {
    if (IS_SERVER) {
      return;
    }

    // Static attributes that we don't include in the Host functional component
    // to eliminate additional overhead
    // TODO: Check if this attribute is removed when the component is moved in
    // the DOM. It should not be removed...
    this.setAttribute("role", "listitem");

    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??= getControlRegisterProperty(
      "getImagePathCallback",
      "ch-navigation-list-render"
    );
  }

  override render() {
    const levelPart = `level-${this.level}` as const;
    const evenLevel = this.level % 2 === 0;
    const evenLevelParts =
      `${getNavigationListItemLevelPart(evenLevel)} ${levelPart}` as const;

    const { sharedState } = this;

    const isInitialLevel = this.level === NAVIGATION_LIST_INITIAL_LEVEL;
    const hasExpandableButton =
      this.expandable &&
      sharedState.navigationListExpanded &&
      sharedState.expandableButton === "decorative";

    const expandableButtonPosition = sharedState.expandableButtonPosition;

    return html`${this.#renderContent(
      evenLevelParts,
      hasExpandableButton,
      expandableButtonPosition,
      isInitialLevel
    )}
    ${this.selected && sharedState.selectedLinkIndicator
      ? html`<div
          class="indicator"
          part=${tokenMap({
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.INDICATOR]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
        ></div>`
      : nothing}
    ${this.expandable
      ? html`<div
          role="list"
          class="expandable"
          part=${tokenMap({
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.GROUP]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              !this.selected,

            // Don't add the even-level/odd-level parts on the initial level to
            // ensure the alignment works properly
            [isInitialLevel ? levelPart : evenLevelParts]: true,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
              hasExpandableButton && expandableButtonPosition === "start",
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
              hasExpandableButton && expandableButtonPosition === "end"
          })}
        >
          <slot></slot>
        </div>`
      : nothing}`;
  }
}

export default ChNavigationListItem;

declare global {
  interface HTMLElementTagNameMap {
    "ch-navigation-list-item": ChNavigationListItem;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChNavigationListItemElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChNavigationListItemElement;
  }

  /**
   * @status experimental
   */// prettier-ignore
  interface HTMLChNavigationListItemElement extends ChNavigationListItem {
    // Extend the ChNavigationListItem class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-navigation-list-item": HTMLChNavigationListItemElement;
  }

  interface HTMLElementTagNameMap {
    "ch-navigation-list-item": HTMLChNavigationListItemElement;
  }
}

