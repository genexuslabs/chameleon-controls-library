import {
  Component,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  State,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";

const PART_PREFIX = "data-modeling-item__";

/**
 * @slot items - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling-item.scss",
  tag: "ch-next-data-modeling-item"
})
export class NextDataModelingItem implements ChComponent {
  @State() expanded = false;

  /**
   * `true` to only show the component that comes with the default slot. Useful
   * when the item is the last one of the list.
   */
  @Prop() readonly addNewEntityMode: boolean = false;

  /**
   * The label of the delete button. Important for accessibility.
   */
  @Prop() readonly deleteButtonLabel: string = "";

  /**
   * The description of the entity.
   */
  @Prop() readonly description: string = "";

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event.
   */
  @Prop() readonly disabled = false;

  /**
   * The label of the edit button. Important for accessibility.
   */
  @Prop() readonly editButtonLabel: string = "";

  /**
   * The name of the entity.
   */
  @Prop() readonly name: string = "";

  /**
   * Fired when the delete button is clicked
   */
  @Event() deleteButtonClick: EventEmitter;

  /**
   * Fired when the edit button is clicked
   */
  @Event() editButtonClick: EventEmitter;

  @Listen("expandedChange")
  handleExpandedChange(event: CustomEvent) {
    event.stopPropagation();
  }

  private emitDelete = (event: UIEvent) => {
    event.stopPropagation();
    this.deleteButtonClick.emit();
  };

  private emitEdit = (event: UIEvent) => {
    event.stopPropagation();
    this.editButtonClick.emit();
  };

  render() {
    return (
      <Host role="listitem">
        {this.addNewEntityMode ? (
          <slot />
        ) : (
          <ch-accordion
            class="accordion"
            part={`${PART_PREFIX}accordion`}
            accessibleName={this.name}
            accessibleDescription={this.description}
            expanded={this.expanded}
            exportparts={`accordion__chevron:${PART_PREFIX}chevron,accordion__expandable:${PART_PREFIX}expandable,accordion__header:${PART_PREFIX}header`}
          >
            <div
              slot="header"
              class="header"
              part={`${PART_PREFIX}header-content`}
            >
              <h1 class="name" part={`${PART_PREFIX}name`}>
                {this.name}
              </h1>
              <p class="description" part={`${PART_PREFIX}description`}>
                {this.description}
              </p>

              <button
                aria-label={this.editButtonLabel}
                class="edit-button"
                part={`${PART_PREFIX}edit-button`}
                disabled={this.disabled}
                type="button"
                onClick={this.emitEdit}
              >
                <div
                  aria-hidden="true"
                  class="img"
                  part={`${PART_PREFIX}edit-button-img`}
                ></div>
              </button>
              <button
                aria-label={this.deleteButtonLabel}
                class="delete-button"
                part={`${PART_PREFIX}delete-button`}
                disabled={this.disabled}
                type="button"
                onClick={this.emitDelete}
              >
                <div
                  aria-hidden="true"
                  class="img"
                  part={`${PART_PREFIX}delete-button-img`}
                ></div>
              </button>
            </div>

            <div slot="content" part={`${PART_PREFIX}content`}>
              <slot />
            </div>
          </ch-accordion>
        )}
      </Host>
    );
  }
}
