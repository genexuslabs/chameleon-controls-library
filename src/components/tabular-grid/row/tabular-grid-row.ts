import { ITabularGridCollapsible } from "../tabular-grid-types";
import HTMLChTabularGridCellElement from "../cell/tabular-grid-cell";
import { tokenMap } from "../../../common/utils";
import { TABULAR_GRID_PARTS_DICTIONARY } from "../../../common/reserved-names";

/**
 * The `ch-tabular-grid-row` component represents a grid row.
 */
export default class HTMLChTabularGridRowElement
  extends HTMLElement
  implements ITabularGridCollapsible
{
  private parentGrid: HTMLChTabularGridElement;
  #parts: boolean | string;

  static get observedAttributes() {
    return ["selected", "marked"];
  }

  constructor() {
    super();
    this.#defineProperties();
  }

  connectedCallback() {
    this.addEventListener("cellCaretClicked", this.cellCaretClickedHandler);

    if (this.selected || this.marked) {
      this.grid.syncRowState(this);
    }

    this.#renderAttributes();
  }

  attributeChangedCallback(name: string, _oldValue: string, value: string) {
    if (name === "selected") {
      this.selected = value !== null ? value !== "false" : false;
    }
    if (name === "marked") {
      this.marked = value !== null ? value !== "false" : false;
    }

    this.grid?.syncRowState(this);
  }

  /**
   * Returns the parent ch-tabular-grid element of the grid row.
   */
  get grid(): HTMLChTabularGridElement {
    return this.parentGrid ?? this.loadParentGrid();
  }

  /**
   * A unique identifier for the row.
   */
  get rowId(): string {
    return this.getAttribute("rowid") ?? "";
  }

  /**
   * A boolean value indicating whether the row is highlighted.
   */
  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }

  set highlighted(value: boolean) {
    const highlightedClasses = this.grid.rowHighlightedClass?.split(" ");

    if (value === true) {
      this.setAttribute("highlighted", "");
      if (this.grid.rowHighlightedClass) {
        this.classList.add(...highlightedClasses);
      }
    } else {
      this.removeAttribute("highlighted");
      if (this.grid.rowHighlightedClass) {
        this.classList.remove(...highlightedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is selected.
   */
  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    const selectedClasses = this.grid.rowSelectedClass?.split(" ");

    if (value === true) {
      if (!this.hasAttribute("selected")) {
        this.setAttribute("selected", "");
      }
      if (this.grid.rowSelectedClass) {
        this.classList.add(...selectedClasses);
      }
    } else {
      this.removeAttribute("selected");
      if (this.grid.rowSelectedClass) {
        this.classList.remove(...selectedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is marked.
   */
  get marked(): boolean {
    return this.hasAttribute("marked");
  }

  set marked(value: boolean) {
    const markedClasses = this.grid.rowMarkedClass?.split(" ");

    if (value === true) {
      if (!this.hasAttribute("marked")) {
        this.setAttribute("marked", "");
      }
      if (this.grid.rowMarkedClass) {
        this.classList.add(...markedClasses);
      }
    } else {
      this.removeAttribute("marked");
      if (this.grid.rowMarkedClass) {
        this.classList.remove(...markedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the row is focused.
   */
  get focused(): boolean {
    return this.hasAttribute("focused");
  }

  set focused(value: boolean) {
    const focusedClasses = this.grid.rowFocusedClass?.split(" ");

    if (value === true) {
      this.setAttribute("focused", "");
      if (this.grid.rowFocusedClass) {
        this.classList.add(...focusedClasses);
      }
    } else {
      this.removeAttribute("focused");
      if (this.grid.rowFocusedClass) {
        this.classList.remove(...focusedClasses);
      }
    }
  }

  /**
   * A boolean value indicating whether the grid row has child rows.
   */
  get hasChildRows(): boolean {
    return !!this.querySelector("ch-tabular-grid-rowset");
  }

  /**
   * A boolean value indicates whether the grid row is collapsed.
   */
  get collapsed(): boolean {
    return this.hasAttribute("collapsed");
  }

  set collapsed(value: boolean) {
    const dispatchEvent = this.collapsed !== value;

    if (value) {
      this.setAttribute("collapsed", "");
    } else {
      this.removeAttribute("collapsed");
    }

    if (dispatchEvent) {
      this.dispatchEvent(
        new CustomEvent("rowCollapsedChanged", {
          bubbles: true,
          composed: true,
          detail: { rowId: this.rowId, collapsed: value }
        })
      );
    }
  }

  /**
   * A boolean value indicates whether the grid row is a leaf node.
   */
  get leaf(): boolean {
    return this.hasAttribute("leaf");
  }

  set leaf(value: boolean) {
    if (value === true) {
      this.setAttribute("leaf", "");
    } else {
      this.removeAttribute("leaf");
    }
  }

  public getCell(
    column: HTMLChTabularGridColumnElement
  ): HTMLChTabularGridCellElement {
    return this.querySelector(
      `:scope > ch-tabular-grid-cell:nth-of-type(${column.physicalOrder})`
    );
  }

  /**
   * A boolean value indicates whether the grid row is visible.
   */
  public isVisible(): boolean {
    return Array.from(
      this.querySelectorAll(":scope > ch-tabular-grid-cell")
    ).some((cell: HTMLChTabularGridCellElement) => cell.isVisible());
  }

  /**
   * Ensures that the row is visible within the control, scrolling the contents of the control if necessary.
   */
  public ensureVisible() {
    this.dispatchEvent(
      new CustomEvent("rowEnsureVisible", { bubbles: true, composed: true })
    );
  }

  /**
   * returns a `DOMRect` object representing the size of the grid row element.
   */
  public getBoundingClientRect(): DOMRect {
    let rect: DOMRect;

    if (!this.firstElementChild) {
      rect = new DOMRect();
    } else if (this.firstElementChild === this.lastElementChild) {
      rect = this.firstElementChild.getBoundingClientRect();
    } else {
      const firstCellRect = this.firstElementChild.getBoundingClientRect();
      const lastCellRect = this.lastElementChild.getBoundingClientRect();

      rect = new DOMRect(
        firstCellRect.x,
        firstCellRect.y,
        lastCellRect.x - firstCellRect.x + lastCellRect.width,
        lastCellRect.y - firstCellRect.y + lastCellRect.height
      );
    }

    return rect;
  }

  private cellCaretClickedHandler(eventInfo: PointerEvent) {
    const targetRow = eventInfo.currentTarget as HTMLChTabularGridRowElement;

    if (targetRow.hasChildRows) {
      this.collapsed = !this.collapsed;
    }
    eventInfo.stopPropagation();
  }

  private loadParentGrid(): HTMLChTabularGridElement {
    this.parentGrid = this.closest("ch-tabular-grid");
    return this.parentGrid;
  }

  #defineProperties = () => {
    this.#parts = (this as any).parts;
    Object.defineProperty(this, "parts", {
      get: () => this.#parts,
      set: value => {
        this.#parts = value;
        this.#renderAttributes();
      },
      enumerable: true,
      configurable: true
    });
  };

  #renderAttributes = () => {
    this.#parts &&
      this.setAttribute(
        "part",
        tokenMap({
          [TABULAR_GRID_PARTS_DICTIONARY.ROW]: true,
          [this.rowId]: true,
          [this.#parts.toString()]: typeof this.#parts === "string"
        })
      );
  };
}

if (!customElements.get("ch-tabular-grid-row")) {
  customElements.define("ch-tabular-grid-row", HTMLChTabularGridRowElement);
}
