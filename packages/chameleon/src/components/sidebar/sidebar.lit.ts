import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import {
  addObservable,
  notifySubscribers,
  removeObservable
} from "./expanded-change-observables.js";

import styles from "./sidebar.scss?inline";

let autoId = 0;

@Component({
  styles,
  tag: "ch-sidebar"
})
export class ChSidebar extends KasstorElement {
  /**
   * This ID is used to identify the control. Useful when the expandedChange
   * event is fired and the subscribed nodes travel all the tree up to the root
   * searching for the ID that emitted the expandedChange event.
   */
  #sidebarId = `ch-sidebar-${autoId++}`;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for expand button when `expanded = true`.
   */
  @property({ attribute: "expand-button-collapse-accessible-name" })
  expandButtonCollapseAccessibleName: string | undefined;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for expand button when `expanded = false`.
   */
  @property({ attribute: "expand-button-expand-accessible-name" })
  expandButtonExpandAccessibleName: string | undefined;

  /**
   * Specifies the caption of the expand button when `expanded = true`.
   */
  @property({ attribute: "expand-button-collapse-caption" })
  expandButtonCollapseCaption: string | undefined;

  /**
   * Specifies the caption of the expand button when `expanded = false`.
   */
  @property({ attribute: "expand-button-expand-caption" })
  expandButtonExpandCaption: string | undefined;

  /**
   * Specifies the position of the expand button relative to the content of the
   * sidebar.
   *  - `"before"`: The expand button is positioned before the content of the sidebar.
   *  - `"after"`: The expand button is positioned after the content of the sidebar.
   */
  // TODO: Revisit this kind of properties to check if we use before/after or start/end
  @property({ reflect: true, attribute: "expand-button-position" })
  expandButtonPosition: "before" | "after" = "after";

  /**
   * Specifies whether the control is expanded or collapsed.
   */
  @property({ reflect: true, type: Boolean }) expanded: boolean = true;
  @Observe("expanded")
  protected expandedChanged(newValue: boolean) {
    notifySubscribers(this.#sidebarId, newValue);
  }

  /**
   * `true` to display a expandable button at the bottom of the control.
   */
  @property({ type: Boolean, attribute: "show-expand-button" })
  showExpandButton: boolean = false;

  /**
   * Emitted when thea element is clicked or the space key is pressed and
   * released.
   */
  @Event() protected expandedChange!: EventEmitter<boolean>;

  #handleExpandedChange = (event: MouseEvent) => {
    event.stopPropagation();

    const newExpandedValue = !this.expanded;
    this.expanded = newExpandedValue;

    this.expandedChange.emit(newExpandedValue);
  };

  #renderExpandButton = () => {
    const accessibleName = this.expanded
      ? this.expandButtonCollapseAccessibleName
      : this.expandButtonExpandAccessibleName;

    const caption = this.expanded
      ? this.expandButtonCollapseCaption
      : this.expandButtonExpandCaption;

    return html`<button
      aria-label=${accessibleName !== caption ? accessibleName : nothing}
      class="expand-button ${this.expanded ? "expanded" : "collapsed"}"
      part="expand-button ${this.expanded ? "expanded" : "collapsed"}"
      type="button"
      @click=${this.#handleExpandedChange}
    >
      ${caption}
    </button>`;
  };

  #initializeComponentFromProperties = () => {
    addObservable(this.id, this.expanded);
    notifySubscribers(this.id, this.expanded); // Must run after the ID and the observable has been configured
  };

  override connectedCallback() {
    super.connectedCallback();

    // The ID MUST be set in this instance, because when searching for the
    // ancestors in `syncStateWithObservableAncestors` we use the DOM id and
    // the method could be executed before the first render of the sidebar,
    // where we typically attach the Host attributes, in this case, the id attr
    this.id ||= this.#sidebarId;

    this.#initializeComponentFromProperties();
  }

  // Lit doesn't properly read properties in the connectedCallback when the
  // component is SSRed
  override willUpdate(): void {
    if (this.wasServerSideRendered) {
      this.wasServerSideRendered = false;
      this.#initializeComponentFromProperties();
    }
  }

  override disconnectedCallback() {
    removeObservable(this.id);
    super.disconnectedCallback();
  }

  override render() {
    return html`${this.showExpandButton &&
      this.expandButtonPosition === "before"
        ? this.#renderExpandButton()
        : nothing}

      <slot></slot>

      ${this.showExpandButton && this.expandButtonPosition === "after"
        ? this.#renderExpandButton()
        : nothing}`;
  }
}

export default ChSidebar;

declare global {
  interface HTMLElementTagNameMap {
    "ch-sidebar": ChSidebar;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChSidebarElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSidebarElement;
  }

  /** Type of the `ch-sidebar`'s `expandedChange` event. */
  // prettier-ignore
  type HTMLChSidebarElementExpandedChangeEvent = HTMLChSidebarElementCustomEvent<
    HTMLChSidebarElementEventMap["expandedChange"]
  >;

  interface HTMLChSidebarElementEventMap {
    expandedChange: boolean;
  }

  interface HTMLChSidebarElementEventTypes {
    expandedChange: HTMLChSidebarElementExpandedChangeEvent;
  }

  /**
   * @fires expandedChange Emitted when thea element is clicked or the space key is pressed and
   *   released.
   */
  // prettier-ignore
  interface HTMLChSidebarElement extends ChSidebar {
    // Extend the ChSidebar class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChSidebarElementEventTypes>(type: K, listener: (this: HTMLChSidebarElement, ev: HTMLChSidebarElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChSidebarElementEventTypes>(type: K, listener: (this: HTMLChSidebarElement, ev: HTMLChSidebarElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-sidebar": HTMLChSidebarElement;
  }

  interface HTMLElementTagNameMap {
    "ch-sidebar": HTMLChSidebarElement;
  }
}

