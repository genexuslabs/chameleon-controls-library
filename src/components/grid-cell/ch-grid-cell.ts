import HTMLChGridRowElement from "../grid-row/ch-grid-row";

export default class HTMLChGridCellElement extends HTMLElement {
  private cellType = ChGridCellType.Single;
  private caret: HTMLDivElement;
  private selector: HTMLInputElement;
  private selectorLabel: HTMLLabelElement;

  constructor() {
    super();
  }

  get type() {
    return this.cellType;
  }

  set type(value: ChGridCellType) {
    switch (value) {
      case ChGridCellType.Single:
        this.defineSingle();
        break;
      case ChGridCellType.Node:
        this.defineNode();
        break;
      case ChGridCellType.Selector:
        this.defineSelector();
        break;
      case ChGridCellType.Drag:
        this.defineDrag();
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

  private defineSingle() {
    this.cellType = ChGridCellType.Single;
  }

  private defineNode() {
    this.cellType = ChGridCellType.Node;

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

  private defineSelector() {
    this.cellType = ChGridCellType.Selector;

    if (!this.shadowRoot || this.shadowRoot.innerHTML == "") {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>label {display:flex}</style>
        <label part="selector-label">
          <input type="checkbox" part="selector">
          <slot></slot>
        </label>
      `;
      
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

  private defineDrag() {
    this.cellType = ChGridCellType.Drag;

    if (!this.shadowRoot || this.shadowRoot.innerHTML == "") {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <div part="drag-icon"></div>
        <slot></slot>
      `;

      this.addEventListener("mousedown", this.dragMouseDownHandler.bind(this));
    }
  }
}

export enum ChGridCellType {
  Single = "single",
  Node = "node",
  Selector = "selector",
  Drag = "drag"
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
