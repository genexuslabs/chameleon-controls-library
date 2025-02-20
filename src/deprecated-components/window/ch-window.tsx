import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Listen,
  Element,
  Host
} from "@stencil/core";
import { adoptCommonThemes } from "../../common/theme";

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

  /**
   * This attribute lets you specify if a div wrapper is rendered for the
   * default slot.
   */
  @Prop() readonly showMain: boolean = true;

  /**
   * This attribute lets you specify if a div between the container and the window
   * space.
   */
  @Prop() readonly showSeparation: boolean = false;

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

  componentDidLoad() {
    if (!this.hidden) {
      this.addListeners();
    }
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

      this.el.style.setProperty("--ch-window-mask-width", `${rect.width}px`);
      this.el.style.setProperty("--ch-window-mask-height", `${rect.height}px`);

      // Nested windows are positioned relative to its initial containing block,
      // so there is no need to align them relative to the document
      if (this.relativeWindow) {
        return;
      }

      this.el.style.setProperty(
        "--ch-window-inset-inline-start",
        `${rect.left}px`
      );
      this.el.style.setProperty(
        "--ch-window-inset-block-start",
        `${rect.top}px`
      );
    } else if (this.isContainerCssOverride || !this.container) {
      this.el.style.removeProperty("--ch-window-mask-width");
      this.el.style.removeProperty("--ch-window-mask-height");

      if (this.relativeWindow) {
        return;
      }
      this.el.style.removeProperty("--ch-window-inset-inline-start");
      this.el.style.removeProperty("--ch-window-inset-block-start");
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
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
  }

  render() {
    const separationY =
      this.yAlign === "outside-start" || this.yAlign === "outside-end";
    const separationX =
      this.xAlign === "outside-start" || this.xAlign === "outside-end";

    return (
      <Host
        style={
          this.relativeWindow && {
            "--ch-window-inset-inline-start": "0px",
            "--ch-window-inset-block-start": "0px"
          }
        }
      >
        <div
          class="mask"
          part="mask"
          ref={el => (this.mask = el)}
          onClick={this.maskClickHandler}
        >
          <section
            class="window ch-scrollable"
            part="window"
            ref={el => (this.window = el)}
          >
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

            {this.showMain ? (
              <div part="main" class="ch-scrollable">
                <slot />
              </div>
            ) : (
              <slot />
            )}

            {this.showFooter && (
              <footer part="footer">
                <slot name="footer"></slot>
              </footer>
            )}
          </section>

          {this.showSeparation && (
            <div
              class={{
                separation: true,
                "separation--x": separationX && !separationY,
                "separation--y": separationY && !separationX,
                "separation--both": separationX && separationY
              }}
              part="separation"
            ></div>
          )}
        </div>
      </Host>
    );
  }
}
