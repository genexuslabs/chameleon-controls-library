import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { DragBarComponent } from "./types";

const START_COMPONENT_MIN_WIDTH = 0; // 0%
const START_COMPONENT_MAX_WIDTH = 100; // 100%

const START_COMPONENT_WIDTH = "--ch-drag-bar__start-component-width";
// const DEFAULT_BLOCK_SIZE = "1fr";
const DEFAULT_INLINE_SIZE = 100;

/**
 * @part bar - The bar of the drag-bar control that divides the start and end components
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
  private sizes: string[] = [];
  private dragBarPosition: string[] = [];

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
    { id: "start-component", size: "70%" },
    { id: "center-component", size: "10%" },
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

      this.lastBarRelativePositionX -= this.el.getBoundingClientRect().left;

      const containerWidth = this.el.scrollWidth;

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

  private getDefaultInlineSize() {
    let remainingRelativeSize = DEFAULT_INLINE_SIZE;
    let totalComponentsWithoutSize = this.components.length;

    this.components.forEach(comp => {
      if (comp.size) {
        totalComponentsWithoutSize--;

        // Subtract the relative size from the total
        if (comp.size.includes("%")) {
          const sizeWithoutFr = comp.size.replace("%", "").trim();

          remainingRelativeSize -= Number(sizeWithoutFr);
        }
      }
    });

    return remainingRelativeSize / totalComponentsWithoutSize;
  }

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

    // Initialize the sizes array
    const defaultSize = this.getDefaultInlineSize();

    this.components.forEach((comp, index) => {
      // Add default size if the component does not have size
      if (!comp.size) {
        comp.size = `${defaultSize}%`;
      }

      // Store the sizes
      this.sizes.push(comp.size);

      // Store each drag bar position
      const dragBarPosition =
        index === 0
          ? comp.size
          : `${comp.size} + ${this.components[index - 1].size}`;
      this.dragBarPosition.push(dragBarPosition);
    });
  }

  componentDidLoad() {
    const removeMouseMoveHandler = () => {
      this.el.removeEventListener("mousemove", this.handleBarDrag, {
        capture: true
      });
    };

    // Add event on mousedown
    this.barRef.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        // Necessary to prevent selecting the inner image of the bar item when
        // the mouse is down
        event.preventDefault();

        this.el.addEventListener("mousemove", this.handleBarDrag, {
          capture: true
        });

        // Remove mousemove and mouseup handlers when mouseup
        this.el.addEventListener(
          "mouseup",
          () => {
            removeMouseMoveHandler();

            this.el.removeEventListener("mouseup", removeMouseMoveHandler);
          },
          { capture: true }
        );

        this.el.addEventListener("mouseleave", () => {
          removeMouseMoveHandler();

          this.el.removeEventListener("mouseleave", removeMouseMoveHandler);
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
        style={{
          "grid-template-columns": this.sizes.join(" ")
        }}
      >
        {this.components.map((component, index) => [
          <slot name={component.id} />,

          index !== lastComponentIndex && (
            <div
              aria-label={this.barAccessibleName}
              title={this.barAccessibleName}
              class="bar"
              part="bar"
              style={{
                "--ch-drag-bar__inset-inline-start": this.dragBarPosition[index]
              }}
              ref={el => (this.barRef = el)}
            ></div>
          )
        ])}
      </Host>
    );
  }
}
