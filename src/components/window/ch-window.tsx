import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Listen,
  Element
} from "@stencil/core";
import { CH_GLOBAL_STYLESHEET } from "../style/ch-global-stylesheet";

export type ChWindowAlign =
  | "outside-start"
  | "inside-start"
  | "center"
  | "inside-end"
  | "outside-end";

const CONTAINING_BLOCK_RESET_CUSTOM_VAR = "--ch-window-relative-position";

/**
 * The 'ch-window' component represents a popup container that is positioned
 * relative to an element or the screen.
 */
@Component({
  tag: "ch-window",
  styleUrl: "ch-window.scss",
  shadow: true
})
export class ChWindow {
  private isContainerCssOverride = false;
  private relativeWindow = false;
  private containerResizeObserver: ResizeObserver;
  private mask: HTMLElement;
  private header: HTMLElement;
  private window: HTMLElement;
  private readonly validCssAligns: ChWindowAlign[] = [
    "outside-start",
    "inside-start",
    "center",
    "inside-end",
    "outside-end"
  ];
  private dragStartX: number;
  private dragStartY: number;
  private draggedX = 0;
  private draggedY = 0;

  @Element() el: HTMLChWindowElement;

  /** The container element for the window. */
  @Prop() readonly container?: HTMLElement;

  @Watch("container")
  containerHandler(value: HTMLElement, oldValue: HTMLElement) {
    this.checkRelativePosition();
    this.containerResizeObserverHandler(value, oldValue);
    this.updatePosition();
  }

  /** The horizontal alignment of the window. */
  @Prop({ reflect: true, mutable: true }) xAlign: ChWindowAlign = "center";

  /** The vertical alignment of the window. */
  @Prop({ reflect: true, mutable: true }) yAlign: ChWindowAlign = "center";

  /** Determines if the window is hidden or visible. */
  @Prop({ reflect: true, mutable: true }) hidden = true;

  @Watch("hidden")
  hiddenHandler() {
    if (this.hidden) {
      this.resetDrag();
      this.removeListeners();
      this.windowClosed.emit();
    } else {
      this.checkRelativePosition();
      this.updatePosition();
      this.watchCSSAlign();
      this.addListeners();
      this.windowOpened.emit();
    }
  }

  /** Specifies whether the window should be displayed as a modal. */
  @Prop({ reflect: true }) readonly modal: boolean = true;

  /** The caption or title of the window. */
  @Prop() readonly caption: string = "";

  /** The text for the close button. */
  @Prop() readonly closeText: string;

  /** The tooltip text for the close button. */
  @Prop() readonly closeTooltip: string;

  /** Determines whether the window should close when clicked outside. */
  @Prop() readonly closeOnOutsideClick: boolean;

  /** Determines whether the window should close when the Escape key is pressed. */
  @Prop() readonly closeOnEscape: boolean;

  /** Specifies the drag behavior of the window. */
  @Prop() readonly allowDrag: "no" | "header" | "box" = "no";

  /**
   * This attribute lets you specify if a footer is rendered at the bottom of the
   * window.
   */
  @Prop() readonly showFooter: boolean = true;

  /**
   * This attribute lets you specify if a header is rendered on top of the window.
   */
  @Prop() readonly showHeader: boolean = true;

  /** Emitted when the window is opened. */
  @Event() windowOpened: EventEmitter;

  /** Emitted when the window is closed. */
  @Event() windowClosed: EventEmitter;

  componentWillLoad() {
    this.containerResizeObserver = new ResizeObserver(this.updatePosition);

    this.containerResizeObserverHandler(this.container);
    this.watchCSSAlign();
    this.loadGlobalStyleSheet();
  }

  @Listen("mousedown", { passive: true })
  mousedownHandler(eventInfo: MouseEvent) {
    if (this.isDraggable(eventInfo.composedPath())) {
      this.dragStartX = eventInfo.clientX;
      this.dragStartY = eventInfo.clientY;

      document.addEventListener("mousemove", this.mousemoveHandler, {
        passive: true
      });
      document.addEventListener("mouseup", this.mouseupHandler, {
        once: true
      });
    }
  }

  @Listen("windowCloseClicked")
  windowCloseClickedHandler() {
    this.hidden = true;
  }

  private mousemoveHandler = (eventInfo: MouseEvent) => {
    const translateX = this.draggedX + eventInfo.clientX - this.dragStartX;
    const translateY = this.draggedY + eventInfo.clientY - this.dragStartY;

    this.window.style.setProperty("--ch-window-x-drag", `${translateX}px`);
    this.window.style.setProperty("--ch-window-y-drag", `${translateY}px`);
  };

  private mouseupHandler = () => {
    document.removeEventListener("mousemove", this.mousemoveHandler);
    this.draggedX = parseInt(
      this.window.style.getPropertyValue("--ch-window-x-drag")
    );
    this.draggedY = parseInt(
      this.window.style.getPropertyValue("--ch-window-y-drag")
    );
  };

  private maskClickHandler = (eventInfo: PointerEvent) => {
    eventInfo.stopPropagation();
  };

  private checkRelativePosition() {
    const computed = getComputedStyle(this.el);
    this.relativeWindow = !!computed.getPropertyValue(
      CONTAINING_BLOCK_RESET_CUSTOM_VAR
    );
  }

  private updatePosition = () => {
    if (!this.isContainerCssOverride && this.container && this.mask) {
      const rect = this.container.getBoundingClientRect();

      this.mask.style.width = `${rect.width}px`;
      this.mask.style.height = `${rect.height}px`;

      // Nested windows are positioned relative to its initial containing block,
      // so there is no need to align them relative to the document
      if (this.relativeWindow) {
        return;
      }

      // TODO: RTL positioning bug
      this.mask.style.setProperty(
        "--ch-window-inset-inline-start",
        `${rect.left}px`
      );
      this.mask.style.setProperty(
        "--ch-window-inset-block-start",
        `${rect.top}px`
      );
    } else if (this.isContainerCssOverride || !this.container) {
      this.mask.style.removeProperty("width");
      this.mask.style.removeProperty("height");

      if (this.relativeWindow) {
        return;
      }
      this.mask.style.removeProperty("--ch-window-inset-inline-start");
      this.mask.style.removeProperty("--ch-window-inset-block-start");
    }
  };

  private resetDrag() {
    this.dragStartX = undefined;
    this.dragStartY = undefined;
    this.draggedX = 0;
    this.draggedY = 0;
    this.window.style.removeProperty("--ch-window-x-drag");
    this.window.style.removeProperty("--ch-window-y-drag");
  }

  private isDraggable(target: EventTarget[]): boolean {
    return (
      this.allowDrag !== "no" &&
      ((this.allowDrag === "header" && target.includes(this.header)) ||
        (this.allowDrag === "box" && target.includes(this.window)))
    );
  }

  private watchCSSAlign() {
    const style = getComputedStyle(this.el);
    const container = style.getPropertyValue("--ch-window-container").trim();
    const xAlign = style
      .getPropertyValue("--ch-window-align-x")
      .trim() as ChWindowAlign;
    const yAlign = style
      .getPropertyValue("--ch-window-align-y")
      .trim() as ChWindowAlign;

    this.isContainerCssOverride = container.includes("window");

    if (this.validCssAligns.includes(xAlign)) {
      this.xAlign = xAlign;
    }
    if (this.validCssAligns.includes(yAlign)) {
      this.yAlign = yAlign;
    }
  }

  private containerResizeObserverHandler(
    observe: HTMLElement,
    unobserve?: HTMLElement
  ) {
    if (observe) {
      this.containerResizeObserver.observe(observe);
    }
    if (unobserve) {
      this.containerResizeObserver.unobserve(unobserve);
    }
  }

  private addListeners() {
    window.addEventListener("resize", this.windowResizeHandler, {
      passive: true
    });

    if (this.container) {
      document.addEventListener("scroll", this.windowScrollHandler, {
        capture: true,
        passive: true
      });
    }

    if (this.closeOnOutsideClick) {
      document.addEventListener("click", this.closeOnOutsideClickHandler, {
        capture: true
      });
    }

    if (this.closeOnEscape) {
      document.addEventListener("keydown", this.closeOnEscapeHandler, {
        capture: true
      });
    }
  }

  private removeListeners() {
    window.removeEventListener("resize", this.windowResizeHandler);
    document.removeEventListener("scroll", this.windowScrollHandler, {
      capture: true
    });
    document.removeEventListener("click", this.closeOnOutsideClickHandler, {
      capture: true
    });
    document.removeEventListener("keydown", this.closeOnEscapeHandler, {
      capture: true
    });
  }

  private windowResizeHandler = () => {
    this.updatePosition();
    this.watchCSSAlign();
  };

  private windowScrollHandler = () => {
    this.updatePosition();
  };

  private closeOnOutsideClickHandler = (eventInfo: PointerEvent) => {
    if (!eventInfo.composedPath().includes(this.window)) {
      this.hidden = true;
    }
  };

  private closeOnEscapeHandler = (eventInfo: KeyboardEvent) => {
    if (eventInfo.key === "Escape") {
      this.hidden = true;
    }
  };

  private loadGlobalStyleSheet() {
    this.el.shadowRoot.adoptedStyleSheets.push(CH_GLOBAL_STYLESHEET);
  }

  render() {
    return (
      <div
        class="mask"
        part="mask"
        style={
          this.relativeWindow && {
            "--ch-window-inset-inline-start": "0px",
            "--ch-window-inset-block-start": "0px"
          }
        }
        ref={el => (this.mask = el)}
        onClick={this.maskClickHandler}
      >
        <section class="window" part="window" ref={el => (this.window = el)}>
          {this.showHeader && (
            <header part="header" ref={el => (this.header = el)}>
              <slot name="header">
                <span part="caption">{this.caption}</span>
                <ch-window-close part="close" title={this.closeTooltip}>
                  {this.closeText}
                </ch-window-close>
              </slot>
            </header>
          )}

          <div part="main">
            <slot></slot>
          </div>

          {this.showFooter && (
            <footer part="footer">
              <slot name="footer"></slot>
            </footer>
          )}
        </section>
      </div>
    );
  }
}
