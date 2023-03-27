import { Component, Element, Host, Prop, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

const START_COMPONENT_MIN_WIDTH = 0; // 0%
const START_COMPONENT_MAX_WIDTH = 100; // 100%

const START_COMPONENT_WIDTH = "--ch-drag-bar__start-component-width";

/**
 * @part bar - The bar of the drag-bar control that divides the start and end components
 * @part bar-item - The bar item displayed in the center of the bar
 * @part bar-item-src - The image control displayed inside the `bar-item`
 * @part end-component - The component that wraps the `end-component` slot
 * @part start-component - The component that wraps the `start-component` slot
 *
 * @slot start-component - The component to be displayed in the left position when using LTR languages
 * @slot end-component - The component to be displayed in the right position when using LTR languages
 */
@Component({
  shadow: true,
  styleUrl: "drag-bar.scss",
  tag: "ch-drag-bar"
})
export class DragBar implements ChComponent {
  private lastBarRelativePositionX = 0;

  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  // Refs
  private barRef: HTMLDivElement;
  private mainContainerRef: HTMLDivElement;
  private startComponentRef: HTMLDivElement;

  @Element() element: HTMLChDragBarElement;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barLabel: string = "";

  /**
   * A CSS class to set as the `ch-next-drag-bar` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * Specifies the bar item src.
   * If defined, it will set an image to replace the default bar item.
   */
  @Prop() readonly barItemSrc: string = "";

  /**
   * If `true` an item at the middle of the bar will be displayed to give more
   * context about the resize action
   */
  @Prop() readonly showBarItem: boolean = true;

  /**
   * Specifies the initial width of the start component
   */
  @Prop() readonly startComponentInitialWidth: string = "50%";

  private keepValueInBetween = (value: number) =>
    Math.max(
      START_COMPONENT_MIN_WIDTH,
      Math.min(value, START_COMPONENT_MAX_WIDTH)
    );

  private handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.lastBarRelativePositionX = event.clientX;

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      this.lastBarRelativePositionX -=
        this.mainContainerRef.getBoundingClientRect().left;

      const containerWidth = this.mainContainerRef.scrollWidth;

      const startComponentWidth =
        containerWidth !== 0
          ? (this.lastBarRelativePositionX / containerWidth) * 100
          : 0;

      this.startComponentRef.style.setProperty(
        "width",
        `${this.keepValueInBetween(startComponentWidth)}%`
      );
    });
  };

  componentDidLoad() {
    const removeMouseMoveHandler = () => {
      this.mainContainerRef.removeEventListener(
        "mousemove",
        this.handleBarDrag,
        {
          capture: true
        }
      );
    };

    // Add event on mousedown
    this.barRef.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        // Necessary to prevent selecting the inner image of the bar item when
        // the mouse is down
        event.preventDefault();

        this.mainContainerRef.addEventListener(
          "mousemove",
          this.handleBarDrag,
          {
            capture: true
          }
        );

        // Remove mousemove and mouseup handlers when mouseup
        this.mainContainerRef.addEventListener(
          "mouseup",
          () => {
            removeMouseMoveHandler();

            this.mainContainerRef.removeEventListener(
              "mouseup",
              removeMouseMoveHandler
            );
          },
          {
            capture: true
          }
        );

        this.mainContainerRef.addEventListener("mouseleave", () => {
          removeMouseMoveHandler();

          this.mainContainerRef.removeEventListener(
            "mouseleave",
            removeMouseMoveHandler
          );
        });
      },
      { capture: true }
    );
  }

  render() {
    return (
      <Host
        class={this.cssClass || undefined}
        style={{ [START_COMPONENT_WIDTH]: this.startComponentInitialWidth }}
      >
        <div class="container" ref={el => (this.mainContainerRef = el)}>
          <div
            class="start-component"
            part="start-component"
            ref={el => (this.startComponentRef = el)}
          >
            <slot name="start-component" />
          </div>

          <div
            aria-label={this.barLabel}
            title={this.barLabel}
            class="bar"
            part="bar"
            ref={el => (this.barRef = el)}
          >
            {this.showBarItem && (
              <div class="bar-item" part="bar-item">
                {this.barItemSrc ? (
                  <img
                    aria-hidden="true"
                    class="bar-item-src"
                    part="bar-item-src"
                    alt=""
                    src={this.barItemSrc}
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    class="bar-item-src"
                    part="bar-item-src"
                    viewBox="0 0 12 57"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.1899 4.59531H3.82598L6.3645 2.0568L4.95028 0.642585L0.000535564 5.59233L4.95028 10.5421L6.3645 9.12787L3.82598 6.58935H10.1899V4.59531Z"
                      fill="#969BA0"
                    />
                    <path
                      d="M0 37.1855V34.6141H2V37.1855H0ZM4 37.1855V34.6141H6V37.1855H4ZM8 37.1855V34.6141H10V37.1855H8ZM0 32.0427V29.4713H2V32.0427H0ZM4 32.0427V29.4713H6V32.0427H4ZM8 32.0427V29.4713H10V32.0427H8ZM0 26.8998V24.3284H2V26.8998H0ZM4 26.8998V24.3284H6V26.8998H4ZM8 26.8998V24.3284H10V26.8998H8ZM0 21.757V19.1855H2V21.757H0ZM4 21.757V19.1855H6V21.757H4ZM8 21.757V19.1855H10V21.757H8Z"
                      transform="translate(1)"
                      fill="#6E7277"
                    />
                    <path
                      d="M4.823 47.2443L6.23722 45.8301L11.187 50.7798L6.23722 55.7296L4.823 54.3154L7.36152 51.7769H0.997556V49.7828L7.36152 49.7828L4.823 47.2443Z"
                      fill="#969BA0"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>

          <div class="end-component" part="end-component">
            <slot name="end-component" />
          </div>
        </div>
      </Host>
    );
  }
}
