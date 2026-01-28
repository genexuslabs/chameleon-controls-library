import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";

import { TABULAR_GRID_NO_ATTRIBUTE } from "../../constants";
import type { TabularGridSortDirection } from "../../types";

import styles from "./tabular-grid-column.scss?inline";

const ariaSortAttribute = "aria-sort";

// Custom vars
const COLUMN_SPAN_CUSTOM_VAR = "--ch-tabular-grid-column__column-span";
const COLUMN_START_CUSTOM_VAR = "--ch-tabular-grid-column__column-start";
const ROW_SPAN_CUSTOM_VAR = "--ch-tabular-grid-column__row-span";

@Component({
  tag: "ch-tabular-grid-column",
  styles
})
export class ChTabularGridColumn extends KasstorElement {
  /**
   * ...
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) accessibleName: string | undefined;

  /**
   * Specifies the caption of the column
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) caption: string | undefined;

  /**
   * Specifies the column span value of the column.
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) colSpan: number | undefined;

  /**
   * Specifies the start position of the column.
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) colStart: number | undefined;

  /**
   * ...
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) parts: string | undefined;

  /**
   * ...
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) resizable: boolean | undefined;

  /**
   * Specifies the row span value of the column.
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) rowSpan: number | undefined;
  @Observe(["colSpan", "colStart", "rowSpan"])
  columnPositionChanged() {
    this.#setColumnPosition();
  }

  /**
   * ...
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) size: string | undefined;

  /**
   * Specifies an accessor for the attribute style of the
   * `ch-tabular-grid-column`. This accessor is useful for SSR scenarios were
   * the Host access is limited (since Lit does not provide the Host
   * declarative component).
   *
   * Without this accessor, the initial load in SSR scenarios would flicker.
   */
  @property({ attribute: "style", reflect: true }) styles: string | undefined;

  /**
   * ...
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) sortable: boolean | undefined;

  /**
   * Specifies if the column content is sorted.
   */
  @property({ attribute: "aria-sort" }) sortDirection:
    | TabularGridSortDirection
    | undefined;
  @Observe("sortDirection")
  protected sortDirectionChanged() {
    this.#setSortDirection();
  }

  #setSortDirection = () => {
    // Add aria-sort attribute
    if (this.sortDirection !== undefined && this.sortDirection !== "none") {
      this.setAttribute(ariaSortAttribute, this.sortDirection);
    }
    // There is no need to try to remove the attribute on the initial load. It
    // is only necessary when changes for the property are made in runtime
    else if (this.hasUpdated) {
      this.removeAttribute(ariaSortAttribute);
    }
  };

  #setColumnPosition = () => {
    const { colStart } = this;
    let { colSpan, rowSpan } = this;
    colSpan ??= 1;
    rowSpan ??= 1;

    let styles: string | undefined = "";

    // Set the column span value
    if (colSpan !== 1) {
      styles = `${COLUMN_SPAN_CUSTOM_VAR}: span ${colSpan}`;
    }
    // Set the column start position
    if (colStart !== undefined) {
      styles += `${COLUMN_START_CUSTOM_VAR}: ${colStart}`;
    }
    // Set the row span value
    if (rowSpan !== 1) {
      styles += `${ROW_SPAN_CUSTOM_VAR}: span ${rowSpan};`;
    }

    this.styles = styles || undefined;
  };

  #initializeComponentFromProperties = () => {
    this.#setSortDirection();
    this.#setColumnPosition();
  };

  override connectedCallback(): void {
    super.connectedCallback();

    this.setAttribute("role", "columnheader");
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

  override render() {
    return html`${this.caption}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-tabular-grid-column": ChTabularGridColumn;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChTabularGridColumnElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChTabularGridColumnElement;
  }

  // prettier-ignore
  interface HTMLChTabularGridColumnElement extends ChTabularGridColumn {
    // Extend the ChTabularGridColumn class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-tabular-grid-column": HTMLChTabularGridColumnElement;
  }

  interface HTMLElementTagNameMap {
    "ch-tabular-grid-column": HTMLChTabularGridColumnElement;
  }
}

