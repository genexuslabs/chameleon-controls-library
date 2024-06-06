import HTMLChGridRowElement from "../grid-row/ch-grid-row";

/**
 * @deprecated Use `ch-tabular-grid` component instead. Use `TabularGridCellType` instead.
 *
 * ChGridCellType indicates the type of cell.
 * "Plain" is a simple cell that shows the contents of it.
 * "Rich" is a rich cell that, in addition to displaying its content, enables
 * the user to execute different actions on the row.
 * The actions are:
 * - allow dragging the row to reorder it.
 * - allow to select the row by means of a checkbox.
 * - allow displaying actions to be executed in the row.
 * "TreeNode" is a cell that represents a node of the Tree.
 */
export enum ChGridCellType {
  Plain = "plain",
  Rich = "rich",
  TreeNode = "node"
}

/**
 * The `ch-grid-cell` component represents a grid cell.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-cell` instead.
 */
export default class HTMLChGridCellElement extends HTMLElement {
  private cellType = ChGridCellType.Plain;
  private caret: HTMLDivElement;
  private drag: HTMLDivElement;
  private action: HTMLButtonElement;
  private selector: HTMLInputElement;
  private selectorLabel: HTMLLabelElement;

  public rowDrag: boolean;
  public rowSelector: boolean;
  public rowActions: boolean;

  static get observedAttributes() {
    return ["cell-type", "row-drag", "row-selector", "row-actions"];
  }

  constructor() {
    super();
    this.defineFocusHandler();
  }

  connectedCallback() {
    if (this.cellType !== ChGridCellType.Plain) {
      this.define();
    }
  }

  attributeChangedCallback(name: string, _oldValue: string, value: string) {
    if (name === "cell-type") {
      this.cellType = value as ChGridCellType;
    }
    if (name === "row-drag") {
      this.cellType = ChGridCellType.Rich;
      this.rowDrag = value !== null ? value !== "false" : false;
    }
    if (name === "row-selector") {
      this.cellType = ChGridCellType.Rich;
      this.rowSelector = value !== null ? value !== "false" : false;
    }
    if (name === "row-actions") {
      this.cellType = ChGridCellType.Rich;
      this.rowActions = value !== null ? value !== "false" : false;
    }
  }

  /**
   * One of "plain", "rich", or "node", indicating the type of cell.
   */
  get type(): ChGridCellType {
    return this.cellType;
  }

  set type(value: ChGridCellType) {
    if (this.cellType !== value) {
      this.cellType = value;
      this.define();
    }
  }

  /**
   * Returns the parent ch-grid element of the cell.
   */
  get grid(): HTMLChGridElement {
    return this.closest("ch-grid");
  }

  /**
   * Returns the ch-grid-column element of the cell.
   */
  get column(): HTMLChGridColumnElement {
    const cellIndex = Array.prototype.indexOf.call(
      this.row.querySelectorAll(`:scope > ch-grid-cell`),
      this
    );
    return this.grid.querySelector(
      `ch-grid-column:nth-of-type(${cellIndex + 1})`
    );
  }

  /**
   * Returns the parent ch-grid-row element of the cell.
   */
  get row(): HTMLChGridRowElement {
    return this.parentElement as HTMLChGridRowElement;
  }

  /**
   * A unique identifier for the cell.
   */
  get cellId(): string {
    return this.getAttribute("cellid") ?? "";
  }

  /**
   * A boolean value indicating whether the cell is selected.
   */
  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    if (value === true) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  }

  /**
   * A boolean value indicating whether the cell is focused.
   */
  get focused(): boolean {
    return this.hasAttribute("focused");
  }

  set focused(value: boolean) {
    if (value === true) {
      this.setAttribute("focused", "");
    } else {
      this.removeAttribute("focused");
    }
  }

  /**
   * A boolean value indicates whether the grid cell is visible.
   */
  public isVisible(): boolean {
    return this.offsetParent !== null;
  }

  /**
   * Ensures that the cell is visible within the control, scrolling the contents of the control if necessary.
   */
  public ensureVisible() {
    this.dispatchEvent(
      new CustomEvent("cellEnsureVisible", { bubbles: true, composed: true })
    );
  }

  /**
   * A boolean value indicates whether the selector of cell is checked or not.
   */
  public setSelectorChecked(value: boolean) {
    this.selector.checked = value;

    if (this.selector.checked) {
      this.selector.setAttribute("part", "selector checked");
    } else {
      this.selector.setAttribute("part", "selector");
    }
  }

  private defineFocusHandler() {
    this.addEventListener("focusin", () => {
      if (!this.rowSelector) {
        this.dispatchEvent(
          new CustomEvent("cellFocused", { bubbles: true, composed: true })
        );
      }
    });
  }

  private caretMouseDownHandler(eventInfo: Event) {
    eventInfo.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("cellCaretClicked", { bubbles: true, composed: true })
    );
  }

  private selectorClickHandler(eventInfo: MouseEvent) {
    eventInfo.stopPropagation();

    this.dispatchEvent(
      new CustomEvent<ChGridCellSelectorClickedEvent>("cellSelectorClicked", {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.selector.checked,
          range: eventInfo.shiftKey
        }
      })
    );
  }

  private selectorLabelClickHandler(eventInfo: MouseEvent) {
    if (!eventInfo.shiftKey) {
      eventInfo.stopPropagation();
    }
  }

  private dragMouseDownHandler(eventInfo: MouseEvent) {
    eventInfo.preventDefault();
    eventInfo.stopPropagation();

    this.dispatchEvent(
      new CustomEvent<ChGridRowDragEvent>("rowDragStarted", {
        bubbles: true,
        composed: true,
        detail: {
          row: this.row
        }
      })
    );
  }

  private actionClickHandler() {
    this.dispatchEvent(
      new CustomEvent("cellRowActionClicked", {
        bubbles: true,
        composed: true
      })
    );
  }

  private define() {
    switch (this.cellType) {
      case ChGridCellType.Rich:
        this.defineRich();
        break;
      case ChGridCellType.TreeNode:
        this.defineTreeNode();
        break;
    }
  }

  private defineRich() {
    let html = "";

    if (!this.shadowRoot || this.shadowRoot.innerHTML === "") {
      this.attachShadow({ mode: "open" });

      if (this.rowDrag) {
        html += `
          <div part="drag-icon"></div>
        `;
      }

      if (this.rowSelector) {
        html += `
          <style>label {display:flex}</style>
          <label part="selector-label">
            <input type="checkbox" part="selector">
          </label>
        `;
      }

      if (this.rowActions) {
        html += `
          <button part="actions-icon"></button>
        `;
      }

      this.shadowRoot.innerHTML = `
        ${html}
        <slot></slot>
      `;

      if (this.rowDrag) {
        this.drag = this.shadowRoot.querySelector("[part='drag-icon']");
        this.drag.addEventListener(
          "mousedown",
          this.dragMouseDownHandler.bind(this)
        );
      }

      if (this.rowActions) {
        this.action = this.shadowRoot.querySelector("[part='actions-icon']");
        this.action.addEventListener(
          "click",
          this.actionClickHandler.bind(this)
        );
      }

      if (this.rowSelector) {
        this.selector = this.shadowRoot.querySelector("[part='selector']");
        this.selector.addEventListener("mousedown", (eventInfo: MouseEvent) =>
          eventInfo.stopPropagation()
        );
        this.selector.addEventListener("touchend", (eventInfo: TouchEvent) =>
          eventInfo.stopPropagation()
        );
        this.selector.addEventListener(
          "click",
          this.selectorClickHandler.bind(this)
        );

        this.selectorLabel = this.shadowRoot.querySelector(
          "[part='selector-label']"
        );
        this.selectorLabel.addEventListener(
          "mousedown",
          (eventInfo: MouseEvent) => eventInfo.stopPropagation()
        );
        this.selectorLabel.addEventListener(
          "touchend",
          (eventInfo: MouseEvent) => eventInfo.stopPropagation()
        );
        this.selectorLabel.addEventListener(
          "click",
          this.selectorLabelClickHandler.bind(this)
        );
      }
    }
  }

  private defineTreeNode() {
    if (!this.shadowRoot || this.shadowRoot.innerHTML === "") {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>:host::before {content: none !important}</style>
        <div part="indent"></div>
        <div part="caret"></div>
        <input type="checkbox" part="node-selector" hidden>
        <div part="node-icon"></div>
        <slot></slot>
      `;

      this.caret = this.shadowRoot.querySelector("[part='caret']");
      this.caret.addEventListener(
        "mousedown",
        this.caretMouseDownHandler.bind(this)
      );
    }
  }
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `ChTabularGridCellSelectorClickedEvent` instead.
 */
export interface ChGridCellSelectorClickedEvent {
  checked: boolean;
  range: boolean;
}

/**
 * @deprecated
 * Use `ch-tabular-grid` component instead.
 * Use `ChTabularGridRowDragEvent` instead.
 */
export interface ChGridRowDragEvent {
  row: HTMLChGridRowElement;
  positionX?: number;
  direction?: "top" | "bottom";
}

if (!customElements.get("ch-grid-cell")) {
  customElements.define("ch-grid-cell", HTMLChGridCellElement);
}
