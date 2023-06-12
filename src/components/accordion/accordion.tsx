import { Component, Event, EventEmitter, Host, Prop, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

const EXPANDABLE = "expandable";

/**
 * @part accordion__expandable - The container of the accordion content
 *
 * @slot header - The component to be displayed in the header of the control
 * @slot content - The component to be displayed as the content of the accordion (below the header)
 */
@Component({
  shadow: true,
  styleUrl: "accordion.scss",
  tag: "ch-accordion"
})
export class Accordion implements ChComponent {
  /**
   * The description of the entity.
   */
  @Prop() readonly accessibleDescription: string = "";

  /**
   * The name of the entity.
   */
  @Prop() readonly accessibleName: string = "";

  /**
   * `true` if the accordion is expanded.
   */
  @Prop({ mutable: true }) expanded = false;

  /**
   * Fired when the content is expanded or collapsed
   */
  @Event() expandedChange: EventEmitter<boolean>;

  private toggleExpanded = () => {
    const newExpandedValue = !this.expanded;
    this.expanded = newExpandedValue;
    this.expandedChange.emit(newExpandedValue);
  };

  render() {
    return (
      <Host>
        <button
          aria-controls={EXPANDABLE}
          aria-expanded={this.expanded.toString()}
          aria-label={this.accessibleName}
          aria-description={this.accessibleDescription || undefined}
          class="header"
          part="accordion__header"
          type="button"
          onClick={this.toggleExpanded}
        >
          <slot name="header" />
          <div
            aria-hidden="true"
            class={{ chevron: true, "chevron--expanded": this.expanded }}
            part="accordion__chevron"
          ></div>
        </button>

        <div
          id={EXPANDABLE}
          class={{ expandable: true, expanded: this.expanded }}
          part="accordion__expandable"
        >
          <slot name="content" />
        </div>
      </Host>
    );
  }
}
