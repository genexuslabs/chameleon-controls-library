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
import { EntityItemType, EntityNameToATTs } from "../data-modeling/data-model";
import { KEY_CODES } from "../../../common/reserverd-names";

export type ErrorText = "Empty" | "AlreadyDefined1" | "AlreadyDefined2";

const NAME = "name";
const DESCRIPTION = "description";
const PART_PREFIX = "data-modeling-subitem__";

/**
 * Determine the maximum amount of ATTs displayed per entity
 */
const MAX_ATTS = 3;

/**
 * @slot items - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling-subitem.scss",
  tag: "ch-next-data-modeling-subitem"
})
export class NextDataModelingSubitem implements ChComponent {
  private inputText = "";

  @State() errorText = "";

  @State() expanded = false;

  @State() showNewFieldBtn = true;

  /**
   * The caption used in the button to show the new field layout. Only useful
   * if `addNewFieldMode = true` and `showNewFieldBtn = true`.
   */
  @Prop() readonly addNewFieldCaption: string = "";

  /**
   * `true` to only show the component that comes with the default slot. Useful
   * when the item is the last one of the list.
   */
  @Prop() readonly addNewFieldMode: boolean = false;

  /**
   * The caption used when the entity is a collection (`type === "LEVEL"`).
   */
  @Prop() readonly collectionCaption: string = "";

  /**
   * The caption used in the button to cancel the adding of the new field.
   * Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`.
   */
  @Prop() readonly cancelNewFieldCaption: string = "";

  /**
   * The caption used in the button to confirm the adding of the new field.
   * Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`.
   */
  @Prop() readonly confirmNewFieldCaption: string = "";

  /**
   * The dataType of the field.
   */
  @Prop() readonly dataType: string = "";

  /**
   * The label of the delete button. Important for accessibility.
   */
  @Prop() readonly deleteButtonLabel: string = "";

  /**
   * The description of the field.
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
   * This property maps entities of the current dataModel with their
   * corresponding ATTs.
   */
  @Prop() readonly entityNameToATTs: EntityNameToATTs = {};

  /**
   * The error texts used for the new field input.
   */
  @Prop() readonly errorTexts: { [key in ErrorText]: string };

  /**
   * This property specifies the defined field names of the current entity.
   */
  @Prop() readonly fieldNames: string[] = [];

  /**
   * The name of the field.
   */
  @Prop() readonly name: string = "";

  /**
   * The type of the field.
   */
  @Prop() readonly type: EntityItemType;

  /**
   * Fired when the delete button is clicked
   */
  @Event() deleteButtonClick: EventEmitter;

  /**
   * Fired when the edit button is clicked
   */
  @Event() editButtonClick: EventEmitter;

  /**
   * Fired when a new file is comitted to be added
   */
  @Event() newField: EventEmitter<string>;

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

  private makeAttsPrettier = (atts: string[]) =>
    atts.length <= MAX_ATTS
      ? "(" + atts.join(", ") + ")"
      : `(${atts.slice(0, MAX_ATTS).join(", ")} (+${atts.length - MAX_ATTS}))`;

  private toggleShowNewField = () => {
    this.errorText = "";
    this.inputText = "";
    this.showNewFieldBtn = !this.showNewFieldBtn;
  };

  private updateInputText = (event: InputEvent) => {
    console.log((event.target as HTMLInputElement).value);

    this.inputText = (event.target as HTMLInputElement).value;
  };

  private confirmNewField = () => {
    const trimmedInput = this.inputText.trim();

    if (trimmedInput === "") {
      this.errorText = this.errorTexts.Empty;
      return;
    }

    if (this.fieldNames.includes(trimmedInput)) {
      this.errorText =
        this.errorTexts.AlreadyDefined1 +
        this.inputText +
        this.errorTexts.AlreadyDefined2;
      return;
    }

    this.newField.emit(trimmedInput);
    this.toggleShowNewField();
  };

  private handleInputTextKeyDown = (event: KeyboardEvent) => {
    if (event.code !== KEY_CODES.ENTER) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.confirmNewField();
  };

  render() {
    const disabledPart = this.disabled ? "disabled" : "";

    return (
      <Host
        role="listitem"
        class={
          this.addNewFieldMode && !this.showNewFieldBtn
            ? "ch-next-data-modeling--add-new-field"
            : undefined
        }
      >
        {
          // Add new field layout (last cell of the collection/entity)
          this.addNewFieldMode ? (
            this.showNewFieldBtn ? (
              <gx-button
                part={`${PART_PREFIX}button-new-entity ${disabledPart}`}
                disabled={this.disabled}
                height="24px"
                type="button"
                onClick={this.toggleShowNewField}
              >
                {this.addNewFieldCaption}
              </gx-button>
            ) : (
              [
                <h1 class="name" part={`${PART_PREFIX}name`}>
                  {this.name}
                </h1>,

                <gx-edit
                  class="field-name"
                  part={`${PART_PREFIX}field-name ${disabledPart}`}
                  disabled={this.disabled}
                  type="text"
                  onInput={this.updateInputText}
                  onKeydown={this.handleInputTextKeyDown}
                ></gx-edit>,

                <gx-button
                  class="button-confirm"
                  part={`${PART_PREFIX}button-confirm ${disabledPart}`}
                  exportparts={`caption:${PART_PREFIX}button-confirm-caption`}
                  disabled={this.disabled}
                  width="32px"
                  height="32px"
                  type="button"
                  onClick={this.confirmNewField}
                >
                  {this.confirmNewFieldCaption}
                </gx-button>,

                <gx-button
                  class="button-cancel"
                  part={`${PART_PREFIX}button-cancel ${disabledPart}`}
                  exportparts={`caption:${PART_PREFIX}button-cancel-caption`}
                  disabled={this.disabled}
                  width="32px"
                  height="32px"
                  type="button"
                  onClick={this.toggleShowNewField}
                >
                  {this.cancelNewFieldCaption}
                </gx-button>,

                !!this.errorText && (
                  <span class="error-text" part={`${PART_PREFIX}error-text`}>
                    {this.errorText}
                  </span>
                )
              ]
            )
          ) : (
            [
              <button
                slot="header"
                class="header"
                part={`${PART_PREFIX}header-content`}
                aria-labelledby={NAME}
                aria-describedby={DESCRIPTION}
              >
                <h1
                  id={NAME}
                  class={{ name: true, "name-entity": this.type === "ENTITY" }}
                  part={`${PART_PREFIX}name`}
                >
                  {this.name}
                </h1>
                {this.type !== "ATT" && (
                  <span
                    class="type"
                    part={
                      this.type === "LEVEL"
                        ? `${PART_PREFIX}collection`
                        : `${PART_PREFIX}entity`
                    }
                  >
                    {this.type === "LEVEL"
                      ? this.collectionCaption
                      : this.makeAttsPrettier(
                          this.entityNameToATTs[this.dataType]
                        )}
                  </span>
                )}

                <p
                  id={DESCRIPTION}
                  class="description"
                  part={`${PART_PREFIX}description`}
                >
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
              </button>,

              this.type === "LEVEL" && <slot />
            ]
          )
        }
      </Host>
    );
  }
}
