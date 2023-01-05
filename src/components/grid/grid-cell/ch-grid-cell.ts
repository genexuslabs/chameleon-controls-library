import HTMLChGridRowElement from "../grid-row/ch-grid-row";

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

  constructor() {
    super();
  }

  get type() {
    return this.cellType;
  }

  set type(value: ChGridCellType) {
    switch (value) {
      case ChGridCellType.Plain:
        this.definePlain();
        break;
      case ChGridCellType.Rich:
        this.defineRich();
        break;
      case ChGridCellType.TreeNode:
        this.defineTreeNode();
        break;
      }
  }

  get row(): HTMLChGridRowElement {
    return this.parentElement as HTMLChGridRowElement;
  }

  get cellId(): string {
    return this.getAttribute("cellid") ?? "";
  }

  set selected(value: boolean) {
    if (value === true) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  public isVisible(): boolean {
    return this.offsetParent !== null;
  }

  public ensureVisible() {
    this.dispatchEvent(
      new CustomEvent("cellEnsureVisible", { bubbles: true, composed: true })
    );
  }

  public setSelectorChecked(value: boolean) {
    this.selector.checked = value;
  }

  private caretClickHandler(eventInfo: Event) {
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
        },
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
        },
      })
    );
  }

  private actionClickHandler(eventInfo: MouseEvent) {
    console.log(eventInfo);
  }

  private definePlain() {
    this.cellType = ChGridCellType.Plain;
  }

  private defineRich() {
    let html = "";
    this.cellType = ChGridCellType.Rich;

    if (!this.shadowRoot || this.shadowRoot.innerHTML == "") {
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
        this.drag.addEventListener("mousedown", this.dragMouseDownHandler.bind(this));
      }

      if (this.rowActions) {
        this.action = this.shadowRoot.querySelector("[part='actions-icon']");
        this.action.addEventListener("click", this.actionClickHandler.bind(this));
      }

      if (this.rowSelector) {
        this.selector = this.shadowRoot.querySelector("[part='selector']");
        this.selector.addEventListener(
          "click",
          this.selectorClickHandler.bind(this)
        );
  
        this.selectorLabel = this.shadowRoot.querySelector("[part='selector-label']");
        this.selectorLabel.addEventListener(
          "click",
          this.selectorLabelClickHandler.bind(this)
        );  
      }
    }
  }

  private defineTreeNode() {
    this.cellType = ChGridCellType.TreeNode;

    if (!this.shadowRoot || this.shadowRoot.innerHTML == "") {
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
      this.caret.addEventListener("click", this.caretClickHandler.bind(this));
    }
  }
}

export enum ChGridCellType {
  Plain = "plain",
  Rich = "rich",
  TreeNode = "node",
  RowAction = "action"
}

export interface ChGridCellSelectorClickedEvent {
  checked: boolean;
  range: boolean;
}

export interface ChGridRowDragEvent {
  row: HTMLChGridRowElement;
  positionX?: number;
  direction?: "top" | "bottom";
}

if (!customElements.get("ch-grid-cell")) {
  customElements.define("ch-grid-cell", HTMLChGridCellElement);
}
