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
export type ErrorType = "Empty" | "AlreadyDefined" | "None";

export type DataModelItemLabels = { [key in DataModelItemLabel]: string };

/**
 * | Value        | Details                                                                  |
 * | ------------ | ------------------------------------------------------------------------ |
 * | `collection` | The caption used when the entity is a collection (`type === "LEVEL"`).   |
 */
export type DataModelItemLabel =
  | "addNewEntity"
  | "addNewField"
  | "cancel"
  | "collection"
  | "confirm"
  | "edit"
  | "delete"
  | "deleteMode"
  | "newEntity"
  | "newField";

const NAME = "name";
const PART_PREFIX = "data-modeling-subitem__";

const CANCEL_CLASS = "button-cancel";
const CONFIRM_CLASS = "button-confirm";

const BUTTON_CONFIRM_PART = (disabledPart: string) =>
  `${PART_PREFIX}button-action confirm${disabledPart}`;

const BUTTON_CANCEL_PART = (disabledPart: string) =>
  `${PART_PREFIX}button-action cancel${disabledPart}`;

/**
 * Determine the maximum amount of ATTs displayed per entity
 */
const MAX_ATTS = 3;

/**
 * @slot items - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling-item.scss",
  tag: "ch-next-data-modeling-item"
})
export class NextDataModelingSubitem implements ChComponent {
  private errorName: string;

  // Refs
  private inputName: HTMLElement;

  @State() errorType: ErrorType = "None";

  @State() showDeleteMode = false;
  @State() showEditMode = false;

  @State() showNewFieldBtn = true;

  @State() expanded = false;

  /**
   * `true` to only show the component that comes with the default slot. Useful
   * when the item is the last one of the list.
   */
  @Prop() readonly addNewFieldMode: boolean = false;

  /**
   * The labels used in the buttons of the items. Important for accessibility.
   */
  @Prop() readonly captions: DataModelItemLabels;

  /**
   * The dataType of the field.
   */
  @Prop() readonly dataType: string = "";

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event.
   */
  @Prop() readonly disabled = false;

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
  @Prop() readonly type: EntityItemType = "LEVEL";

  /**
   * Fired when the item is confirmed to be deleted
   */
  @Event() deleteField: EventEmitter;

  /**
   * Fired when the item is edited
   */
  @Event() editField: EventEmitter<string>;

  /**
   * Fired when a new file is comitted to be added
   */
  @Event() newField: EventEmitter<string>;

  @Listen("expandedChange")
  handleExpandedChange(event: CustomEvent) {
    event.stopPropagation();
  }

  /**
   * Returns:
   *   @example ```(Scorer, Goals)```
   *   @example ```(Name, Age, Nationality (+3))```
   */
  private makeAttsPrettier = (atts: string[]) =>
    atts.length <= MAX_ATTS
      ? "(" + atts.join(", ") + ")"
      : `(${atts.slice(0, MAX_ATTS).join(", ")} (+${atts.length - MAX_ATTS}))`;

  private emitDelete = (event: UIEvent) => {
    event.stopPropagation();
    this.deleteField.emit();
  };

  private toggleEditMode = () => {
    this.showEditMode = !this.showEditMode;
  };

  private toggleDeleteMode = () => {
    this.showDeleteMode = !this.showDeleteMode;
  };

  private toggleShowNewField = () => {
    this.errorType = "None";
    this.showNewFieldBtn = !this.showNewFieldBtn;
  };

  /**
   * @todo TODO: Improve typing
   * WA function to get the gx-edit's input value
   * @param editElement An HTMLGxEditElement that is implemented in the web-controls-library
   */
  private getGxEditInputValue = (editElement: HTMLElement) =>
    (editElement.shadowRoot.firstElementChild as HTMLInputElement).value;

  private confirmEdit = () => {
    const trimmedInputName = this.getGxEditInputValue(this.inputName).trim();

    // Force re-render. Useful when the error type don't change but the
    // displayed error text must change
    this.errorType = "None";

    if (trimmedInputName === "") {
      this.errorType = "Empty";
      return;
    }

    if (this.fieldNames.includes(trimmedInputName)) {
      this.errorType = "AlreadyDefined";
      this.errorName = trimmedInputName;
      return;
    }

    if (this.name !== trimmedInputName) {
      this.editField.emit(trimmedInputName);
    }

    this.toggleEditMode();
  };

  private confirmNewField = () => {
    const trimmedInput = this.getGxEditInputValue(this.inputName).trim();

    // Force re-render. Useful when the error type don't change but the
    // displayed error text must change
    this.errorType = "None";

    if (trimmedInput === "") {
      this.errorType = "Empty";
      return;
    }

    if (this.fieldNames.includes(trimmedInput)) {
      this.errorType = "AlreadyDefined";
      this.errorName = trimmedInput;
      return;
    }

    this.newField.emit(trimmedInput);
    this.toggleShowNewField();
  };

  private keyDownEditField = (event: KeyboardEvent) => {
    if (event.code !== KEY_CODES.ENTER) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.confirmEdit();
  };

  private keyDownNewField = (event: KeyboardEvent) => {
    if (event.code !== KEY_CODES.ENTER) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.confirmNewField();
  };

  private newFieldMode = (
    captions: DataModelItemLabels,
    disabledPart: string
  ) =>
    this.showNewFieldBtn ? (
      <button
        class="button-new-entity"
        part={`${PART_PREFIX}button-new-entity${disabledPart}`}
        disabled={this.disabled}
        type="button"
        onClick={this.toggleShowNewField}
      >
        {this.level === 0 ? captions.addNewEntity : captions.addNewField}
      </button>
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
          {this.level === 0 ? captions.newEntity : captions.newField}
        </h1>,

        <gx-edit
          class="field-name"
          part={`${PART_PREFIX}input${disabledPart}`}
          disabled={this.disabled}
          type="text"
          ref={el => (this.inputName = el as HTMLElement)}
          onKeydown={this.keyDownNewField}
        ></gx-edit>,

        <button
          aria-label={captions.confirm}
          class={CONFIRM_CLASS}
          part={BUTTON_CONFIRM_PART(disabledPart)}
          disabled={this.disabled}
          type="button"
          onClick={this.confirmNewField}
        ></button>,

        <button
          aria-label={captions.cancel}
          class={CANCEL_CLASS}
          part={BUTTON_CANCEL_PART(disabledPart)}
          disabled={this.disabled}
          type="button"
          onClick={this.toggleShowNewField}
        ></button>,

        this.errorType !== "None" && (
          <p class="error-text" part={`${PART_PREFIX}error-text`}>
            {this.errorType === "Empty"
              ? this.errorTexts.Empty
              : [
                  this.errorTexts.AlreadyDefined1,
                  <span part={`${PART_PREFIX}error-text-name`}>
                    {this.errorName}
                  </span>,
                  this.errorTexts.AlreadyDefined2
                ]}
          </p>
        )
      ]
    );

  private editMode = (captions: DataModelItemLabels, disabledPart: string) => [
    <div
      slot="header"
      class={{
        header: true,
        "edit-mode": this.showEditMode
      }}
      part={`${PART_PREFIX}header-content`}
      tabindex="0"
    >
      {this.level === 2 && (
        <div
          aria-hidden="true"
          class="sub-field"
          part={`${PART_PREFIX}sub-field`}
        ></div>
      )}

      {!this.showEditMode && [
        // Readonly
        <h1
          id={NAME}
          class={{
            name: true,
            "name-entity": this.type === "ENTITY"
          }}
          part={`${PART_PREFIX}name`}
        >
          {this.name}
        </h1>,

        this.level !== 0 && this.type !== "ATT" && (
          <span
            class="type"
            part={
              this.type === "LEVEL"
                ? `${PART_PREFIX}collection`
                : `${PART_PREFIX}entity`
            }
          >
            {this.type === "LEVEL"
              ? captions.collection
              : this.makeAttsPrettier(this.entityNameToATTs[this.dataType])}
          </span>
        )
      ]}

      {
        // Delete Mode
        this.showDeleteMode ? (
          <div class="delete-mode" part={`${PART_PREFIX}delete-mode`}>
            {captions.deleteMode}

            <button // Confirm delete
              aria-label={captions.confirm}
              part={`${PART_PREFIX}button-delete-action confirm${disabledPart}`}
              disabled={this.disabled}
              type="button"
              onClick={this.emitDelete}
            ></button>

            <button // Cancel delete
              aria-label={captions.cancel}
              part={`${PART_PREFIX}button-delete-action cancel${disabledPart}`}
              disabled={this.disabled}
              type="button"
              onClick={this.toggleDeleteMode}
            ></button>
          </div>
        ) : (
          // Dummy div to trigger an Stencil optimization by reusing DOM nodes
          <div class="optimization">
            {this.showEditMode && [
              // Editable
              <gx-edit
                class="name"
                part={`${PART_PREFIX}input${disabledPart}`}
                disabled={this.disabled}
                type="text"
                value={this.name}
                ref={el => (this.inputName = el as HTMLElement)}
                onKeydown={this.keyDownEditField}
              ></gx-edit>
            ]}

            <button
              aria-label={captions.edit}
              class={
                this.showEditMode ? CONFIRM_CLASS : "button-primary button-edit"
              }
              part={
                this.showEditMode
                  ? BUTTON_CONFIRM_PART(disabledPart)
                  : `${PART_PREFIX}button-primary edit${disabledPart}`
              }
              disabled={this.disabled}
              type="button"
              onClick={
                this.showEditMode ? this.confirmEdit : this.toggleEditMode
              }
            ></button>

            <button
              aria-label={captions.delete}
              class={
                this.showEditMode
                  ? CANCEL_CLASS
                  : "button-primary button-delete"
              }
              part={
                this.showEditMode
                  ? BUTTON_CANCEL_PART(disabledPart)
                  : `${PART_PREFIX}button-primary delete${disabledPart}`
              }
              disabled={this.disabled}
              type="button"
              onClick={
                this.showEditMode ? this.toggleEditMode : this.toggleDeleteMode
              }
            ></button>
          </div>
        )
      }
    </div>,

    this.type === "LEVEL" &&
      (this.level === 0 ? (
        <div slot="content" part={`${PART_PREFIX}content`}>
          <slot />
        </div>
      ) : (
        <slot />
      ))
  ];

  render() {
    const addNewField = this.addNewFieldMode && !this.showNewFieldBtn;
    const disabledPart = this.disabled ? " disabled" : "";
    const captions = this.captions;

    return (
      <Host
        role="listitem"
        aria-labelledby={NAME}
        class={{
          "ch-next-data-modeling--add-new-field":
            addNewField && this.level !== 2,
          "ch-next-data-modeling--add-new-field-level-2":
            addNewField && this.level === 2,
          "gx-disabled": this.disabled
        }}
      >
        {
          // Add new field layout (last cell of the collection/entity)
          this.addNewFieldMode ? (
            this.newFieldMode(captions, disabledPart)
          ) : this.level === 0 ? (
            <ch-accordion
              class="accordion"
              part={`${PART_PREFIX}accordion`}
              accessibleName={this.name}
              expanded={this.expanded}
              exportparts={`accordion__chevron:${PART_PREFIX}chevron,accordion__expandable:${PART_PREFIX}expandable,accordion__header:${PART_PREFIX}header`}
            >
              {this.editMode(captions, disabledPart)}
            </ch-accordion>
          ) : (
            this.editMode(captions, disabledPart)
          )
        }
      </Host>
    );
  }
}
