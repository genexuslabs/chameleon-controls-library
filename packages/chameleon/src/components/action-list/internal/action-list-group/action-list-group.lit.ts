import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { tokenMap } from "../../../../utilities/mapping/token-map";
import {
  ACTION_LIST_GROUP_EXPORT_PARTS,
  ACTION_LIST_GROUP_PARTS_DICTIONARY,
  ACTION_LIST_PARTS_DICTIONARY
} from "../../../../utilities/reserved-names/parts/action-list";

import styles from "./action-list-group.scss?inline";

const EXPANDABLE_ID = "expandable";

/**
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-action-list-group",
  shadow: { delegatesFocus: true }
})
export class ChActionListGroup extends KasstorElement {
  #buttonRef: Ref<HTMLButtonElement> = createRef();

  /**
   * This attributes specifies the caption of the control
   */
  @property({ attribute: false }) caption: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @state() downloading: boolean = false;

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @property({ attribute: false }) expandable: boolean | undefined;

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @property({ attribute: false }) expanded: boolean | undefined;
  // @Watch("expanded")
  // expandedChanged(isExpanded: boolean) {
  //   // Wait until all properties are updated before lazy loading. Otherwise, the
  //   // lazyLoad property could be updated just after the executing of the function
  //   setTimeout(() => {
  //     this.#lazyLoadItems(isExpanded);
  //   });
  // }

  /**
   * Determine if the items are lazy loaded when opening the first time the
   * control.
   */
  @state() lazyLoad: boolean = false;

  /**
   * This attribute represents additional info for the control that is included
   * when dragging the item.
   */
  @property({ attribute: false }) metadata: string | undefined;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @property({ attribute: false }) parts: string | undefined;
  // @Watch("parts")
  // partsChanged(newParts: string) {
  //   this.#setExportParts(newParts);
  // }

  /**
   * This attribute lets you specify if the item is selected
   */
  @property({ attribute: false }) selected: boolean = false;

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @property({ type: Boolean, attribute: "show-downloading-spinner" })
  showDownloadingSpinner: boolean = true;

  // /**
  //  * Fired when the item is being dragged.
  //  */
  // @Event() itemDragStart: EventEmitter<TreeViewItemDragStartInfo>;

  /**
   * Fired when the lazy control is expanded an its content must be loaded.
   */
  @Event() loadLazyContent!: EventEmitter<string>;

  /**
   * Set the focus in the control if `expandable === true`.
   */
  setFocus() {
    if (this.expandable && this.#buttonRef.value) {
      this.#buttonRef.value.focus();
    }
  }

  #getExpandedValue = (): boolean => (this.expandable ? (this.expanded ?? false) : true);

  protected override firstWillUpdate(): void {
    // Static attributes
    this.setAttribute("role", "listitem");
    this.setAttribute("part", ACTION_LIST_PARTS_DICTIONARY.GROUP);
    this.setAttribute("exportparts", ACTION_LIST_GROUP_EXPORT_PARTS);
  }

  override render() {
    const hasContent = !this.lazyLoad;
    const expanded = hasContent && this.#getExpandedValue();

    return html`${this.expandable
      ? html`<button
          aria-controls=${hasContent ? EXPANDABLE_ID : nothing}
          aria-expanded=${hasContent ? expanded.toString() : nothing}
          class=${tokenMap({
            action: true,
            "action--collapsed": !expanded
          })}
          ?disabled=${this.disabled}
          part=${tokenMap({
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.ACTION]: true,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.SELECTED]: this.selected,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
          type="button"
          ${ref(this.#buttonRef)}
        >
          ${this.caption}
        </button>`
      : html`<span
          class="action"
          part=${tokenMap({
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.CAPTION]: true,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
        >
          ${this.caption}
        </span>`}
    ${hasContent
      ? html`<ul
          aria-busy=${(!!this.downloading).toString()}
          aria-live=${this.downloading ? "polite" : nothing}
          class=${tokenMap({
            expandable: true,
            "expandable--collapsed": !expanded,
            "expandable--lazy-loaded": !this.downloading
          })}
          part=${tokenMap({
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.EXPANDABLE]: true,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.EXPANDED]: expanded,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.COLLAPSED]: !expanded,
            [ACTION_LIST_GROUP_PARTS_DICTIONARY.LAZY_LOADED]: !this.downloading
          })}
          id=${EXPANDABLE_ID}
        >
          <slot></slot>
        </ul>`
      : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-action-list-group": ChActionListGroup;
  }
}


// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChActionListGroupElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChActionListGroupElement;
  }

  /** Type of the `ch-action-list-group`'s `loadLazyContent` event. */
  // prettier-ignore
  type HTMLChActionListGroupElementLoadLazyContentEvent = HTMLChActionListGroupElementCustomEvent<
    HTMLChActionListGroupElementEventMap["loadLazyContent"]
  >;

  interface HTMLChActionListGroupElementEventMap {
    loadLazyContent: string;
  }

  interface HTMLChActionListGroupElementEventTypes {
    loadLazyContent: HTMLChActionListGroupElementLoadLazyContentEvent;
  }

  /**
   * @status experimental
   *
   * @fires loadLazyContent Fired when the lazy control is expanded an its content must be loaded.
   */
  // prettier-ignore
  interface HTMLChActionListGroupElement extends ChActionListGroup {
    // Extend the ChActionListGroup class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChActionListGroupElementEventTypes>(type: K, listener: (this: HTMLChActionListGroupElement, ev: HTMLChActionListGroupElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChActionListGroupElementEventTypes>(type: K, listener: (this: HTMLChActionListGroupElement, ev: HTMLChActionListGroupElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-action-list-group": HTMLChActionListGroupElement;
  }

  interface HTMLElementTagNameMap {
    "ch-action-list-group": HTMLChActionListGroupElement;
  }
}

