import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";
import { EntityItemType, EntityNameToATTs } from "../data-modeling/data-model";
import { KEY_CODES } from "../../../common/reserverd-names";

export type ErrorText = "Empty" | "AlreadyDefined1" | "AlreadyDefined2";
export type ErrorType = "Empty" | "AlreadyDefined" | "None";

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

  @State() errorType: ErrorType = "None";

  @State() showDeleteMode = false;

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
   * The label of the cancel button in delete mode. Important for
   * accessibility.
   */
  @Prop() readonly deleteModeCancelLabel: string = "";

  /**
   * The caption used in the message to confirm the delete of the field.
   */
  @Prop() readonly deleteModeCaption: string = "";

  /**
   * The label of the confirm button in delete mode. Important for
   * accessibility.
   */
  @Prop() readonly deleteModeConfirmLabel: string = "";

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
   * This property specifies at which collection level the field is located.
   */
  @Prop() readonly level: 0 | 1 | 2 = 1;

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
  @Event() deleteField: EventEmitter;

  /**
   * Fired when the edit button is clicked
   */
  @Event() editButtonClick: EventEmitter;

  /**
   * Fired when a new file is comitted to be added
   */
  @Event() newField: EventEmitter<string>;

  private emitDelete = (event: UIEvent) => {
    event.stopPropagation();
    this.deleteField.emit();
  };

  private emitEdit = (event: UIEvent) => {
    event.stopPropagation();
    this.editButtonClick.emit();
  };

  private toggleDeleteMode = () => {
    this.showDeleteMode = !this.showDeleteMode;
  };

  /**
   * Returns:
   *   @example ```(Scorer, Goals)```
   *   @example ```(Name, Age, Nationality (+3))```
   */
  private makeAttsPrettier = (atts: string[]) =>
    atts.length <= MAX_ATTS
      ? "(" + atts.join(", ") + ")"
      : `(${atts.slice(0, MAX_ATTS).join(", ")} (+${atts.length - MAX_ATTS}))`;

  private toggleShowNewField = () => {
    this.errorType = "None";
    this.inputText = "";
    this.showNewFieldBtn = !this.showNewFieldBtn;
  };

  private updateInputText = (event: InputEvent) => {
    console.log((event.target as HTMLInputElement).value);

    this.inputText = (event.target as HTMLInputElement).value;
  };

  private confirmNewField = () => {
    const trimmedInput = this.inputText.trim();

    // Force re-render. Useful when the error type don't change but the
    // displayed error text must change
    this.errorType = "None";

    if (trimmedInput === "") {
      this.errorType = "Empty";
      return;
    }

    if (this.fieldNames.includes(trimmedInput)) {
      this.errorType = "AlreadyDefined";
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

  private newFieldMode = (disabledPart: string) =>
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
        this.level === 2 && (
          <div
            aria-hidden="true"
            class="sub-field"
            part={`${PART_PREFIX}sub-field`}
          ></div>
        ),

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

        this.errorType !== "None" && (
          <p class="error-text" part={`${PART_PREFIX}error-text`}>
            {this.errorType === "Empty"
              ? this.errorTexts.Empty
              : [
                  this.errorTexts.AlreadyDefined1,
                  <span part={`${PART_PREFIX}error-text-name`}>
                    {this.inputText}
                  </span>,
                  this.errorTexts.AlreadyDefined2
                ]}
          </p>
        )
      ]
    );

  render() {
    const addNewField = this.addNewFieldMode && !this.showNewFieldBtn;

    return (
      <Host
        role="listitem"
        class={{
          "ch-next-data-modeling--add-new-field":
            addNewField && this.level !== 2,
          "ch-next-data-modeling--add-new-field-level-2":
            addNewField && this.level === 2
        }}
      >
        {
          // Add new field layout (last cell of the collection/entity)
          this.addNewFieldMode
            ? this.newFieldMode(this.disabled ? "disabled" : "")
            : [
                <button
                  slot="header"
                  class="header"
                  part={`${PART_PREFIX}header-content`}
                  aria-labelledby={NAME}
                  aria-describedby={DESCRIPTION}
                >
                  {this.level === 2 && (
                    <div
                      aria-hidden="true"
                      class="sub-field"
                      part={`${PART_PREFIX}sub-field`}
                    ></div>
                  )}

                  <h1
                    id={NAME}
                    class={{
                      name: true,
                      "name-entity": this.type === "ENTITY"
                    }}
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

                  {
                    // Delete Mode
                    this.showDeleteMode ? (
                      <div
                        class="delete-mode"
                        part={`${PART_PREFIX}delete-mode`}
                      >
                        {this.deleteModeCaption}

                        <button
                          aria-label={this.deleteModeConfirmLabel}
                          part={`${PART_PREFIX}delete-mode-confirm`}
                          disabled={this.disabled}
                          type="button"
                          onClick={this.emitDelete}
                        ></button>

                        <button
                          aria-label={this.deleteModeCancelLabel}
                          part={`${PART_PREFIX}delete-mode-cancel`}
                          disabled={this.disabled}
                          type="button"
                          onClick={this.toggleDeleteMode}
                        ></button>
                      </div>
                    ) : (
                      [
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
                        </button>,

                        <button
                          aria-label={this.deleteButtonLabel}
                          class="delete-button"
                          part={`${PART_PREFIX}delete-button`}
                          disabled={this.disabled}
                          type="button"
                          onClick={this.toggleDeleteMode}
                        >
                          <div
                            aria-hidden="true"
                            class="img"
                            part={`${PART_PREFIX}delete-button-img`}
                          ></div>
                        </button>
                      ]
                    )
                  }
                </button>,

                this.type === "LEVEL" && <slot />
              ]
        }
      </Host>
    );
  }
}
