import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import {
  TABULAR_GRID_BOOLEAN_TYPE_PROP,
  TABULAR_GRID_NO_ATTRIBUTE
} from "./constants";
import type {
  TabularGridColumnItemModel,
  TabularGridColumnsModel,
  TabularGridColumnsMultiLevelModel,
  TabularGridColumnsSingleLevelModel,
  TabularGridModel
} from "./types";

// Side-effect to define the tabular-grid-column element
import "./internal/tabular-grid-column/tabular-grid-column.lit";

import styles from "./tabular-grid-render.scss?inline";

const isSingleLevelModel = (
  columnsModel: TabularGridColumnsModel
): columnsModel is TabularGridColumnsSingleLevelModel =>
  !Array.isArray(columnsModel[0]);

@Component({
  tag: "ch-tabular-grid-render",
  styles
})
export class ChTabularGridRender extends KasstorElement {
  /**
   * Determines if the columns can be hidden by the user
   */
  @property(TABULAR_GRID_BOOLEAN_TYPE_PROP) columnHideable: boolean = true;

  /**
   *  Determines if the columns can be resized by the user.
   */
  @property(TABULAR_GRID_BOOLEAN_TYPE_PROP) columnResizable: boolean = true;

  /**
   * Determines if the columns can be sorted by the user.
   */
  @property(TABULAR_GRID_BOOLEAN_TYPE_PROP) columnSortable: boolean = true;

  /**
   * Specifies the content of the tabular grid control.
   */
  @property(TABULAR_GRID_NO_ATTRIBUTE) model: TabularGridModel | undefined;

  /*
  #renderGrid = (
    columns: TabularGridColumnsModel,
    rowsets: TabularGridRowsetsModel
  ) => (
    <ch-tabular-grid key={this.#modelVersion} class="tabular-grid">
      {this.#renderColumns(columns)}
      {this.#renderRowsets(rowsets)}
    </ch-tabular-grid>
  );

  #renderColumns = (columns: TabularGridColumnsModel) => (
    <ch-tabular-grid-columnset parts={true} class="tabular-grid-column-set">
      {columns.map(this.#renderColumn)}
    </ch-tabular-grid-columnset>
  );
*/

  #renderColumns = (columns: TabularGridColumnsModel) => {
    if (columns.length === 0) {
      // TODO: Should we throw a warning??
      return undefined;
    }

    const multiLevelModel = isSingleLevelModel(columns)
      ? ([columns] satisfies TabularGridColumnsMultiLevelModel)
      : columns;

    return multiLevelModel.map(this.#renderColumnGroup);
  };

  #renderColumnGroup = (columnGroup: TabularGridColumnItemModel[]) =>
    html`<div class="column-row" role="row">
      ${repeat(columnGroup, column => column.id, this.#renderColumn)}
    </div>`;

  #renderColumn = (column: TabularGridColumnItemModel) =>
    html`<ch-tabular-grid-column
      .accessibleName=${column.accessibleName}
      .caption=${column.caption}
      .colSpan=${column.colSpan}
      .colStart=${column.colStart}
      .parts=${column.parts}
      .resizable=${column.resizable ?? this.columnResizable}
      .rowSpan=${column.rowSpan}
      .size=${column.size}
      .sortable=${column.sortable ?? this.columnSortable}
      .sortDirection=${column.sortDirection}
    ></ch-tabular-grid-column>`;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override render() {
    if (this.model == null) {
      return undefined;
    }

    return html`<div class="rowgroup" role="rowgroup">
      ${this.#renderColumns(this.model.columns)}
    </div>`;
  }
}

export default ChTabularGridRender;

declare global {
  interface HTMLElementTagNameMap {
    "ch-tabular-grid-render": ChTabularGridRender;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChTabularGridRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChTabularGridRenderElement;
  }

  // prettier-ignore
  interface HTMLChTabularGridRenderElement extends ChTabularGridRender {
    // Extend the ChTabularGridRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-tabular-grid-render": HTMLChTabularGridRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-tabular-grid-render": HTMLChTabularGridRenderElement;
  }
}

