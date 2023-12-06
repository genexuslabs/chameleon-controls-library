import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { DragBarComponent } from "./types";

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
  private rtlWatcher: MutationObserver;

  // Refs
  private barRef: HTMLDivElement;
  private mainContainerRef: HTMLDivElement;

  @Element() el: HTMLChDragBarElement;

  /**
   * Determine the language direction.
   */
  @State() isRTLDirection = false;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barAccessibleName: string = "";

  /**
   * Specifies the list of component that are displayed. Each component will be
   * separated via a drag bar.
   */
  @Prop() readonly components: DragBarComponent[] = [
    { id: "start-component" },
    { id: "end-component" }
  ];

  /**
   * A CSS class to set as the `ch-next-drag-bar` element class.
   */
  @Prop() readonly cssClass: string;

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

      let startComponentWidth =
        containerWidth !== 0
          ? (this.lastBarRelativePositionX / containerWidth) * 100
          : 0;

      if (this.isRTLDirection) {
        startComponentWidth = 100 - startComponentWidth;
      }

      this.el.style.setProperty(
        START_COMPONENT_WIDTH,
        `${this.keepValueInBetween(startComponentWidth)}%`
      );
    });
  };

  connectedCallback() {
    this.rtlWatcher = new MutationObserver(mutations => {
      this.isRTLDirection = (mutations[0].target as Document).dir === "rtl";
    });

    // Watch changes in the dir attribute of the html tag
    this.rtlWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
      childList: false,
      subtree: false
    });

    // Initialize the value, since the observer won't do it
    this.isRTLDirection = document.documentElement.dir === "rtl";
  }

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

  disconnectedCallback() {
    if (this.rtlWatcher) {
      this.rtlWatcher.disconnect();
      this.rtlWatcher = null;
    }
  }

  render() {
    const lastComponentIndex = this.components.length - 1;

    return (
      <Host
        class={this.cssClass || undefined}
        style={{ [START_COMPONENT_WIDTH]: this.startComponentInitialWidth }}
      >
        <div class="container" ref={el => (this.mainContainerRef = el)}>
          {this.components.map((component, index) => [
            <div class={component.id} part={component.id}>
              <slot name={component.id} />
            </div>,

            index !== lastComponentIndex && (
              <div
                aria-label={this.barAccessibleName}
                title={this.barAccessibleName}
                class="bar"
                part="bar"
                ref={el => (this.barRef = el)}
              ></div>
            )
          ])}
        </div>
      </Host>
    );
  }
}
