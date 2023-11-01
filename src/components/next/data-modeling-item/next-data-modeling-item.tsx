import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  State,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";
import { EntityItemType, EntityNameToATTs } from "../data-modeling/data-model";
import { KEY_CODES } from "../../../common/reserverd-names";

export type ErrorText =
  | "Empty"
  | "AlreadyDefined1"
  | "AlreadyDefinedEntity1"
  | "AlreadyDefined2";
export type ErrorType = "Empty" | "AlreadyDefined" | "None";

export type DataModelItemLabels = { [key in DataModelItemLabel]: string };

/**
 * | Value        | Details                                                                  |
 * | ------------ | ------------------------------------------------------------------------ |
 * | `collection` | The caption used when the entity is a collection (`type === "LEVEL"`).   |
 */
export type DataModelItemLabel =
  | "ATT"
  | "ENTITY"
  | "LEVEL"
  | "adding"
  | "addNewEntity"
  | "addNewField"
  | "cancel"
  | "collection"
  | "confirm"
  | "edit"
  | "editing"
  | "delete"
  | "deleting"
  | "deleteMode"
  | "newEntity"
  | "newField";

export type EntityInfo = { name: string; level: ItemInfo[] };
export type ItemInfo = { name: string; type?: EntityItemType };

type ActionMetadata = {
  label: string;
  class: string;
  part: string;
  event: (event: UIEvent) => void;
};

type ActionsMetadata = {
  [key in Mode]: ActionMetadata[];
};

type ActionsMetadataFunction = (
  captions: DataModelItemLabels,
  disabledPart: string
) => ActionsMetadata;

export type Mode = "add" | "delete" | "edit" | "normal";
type WaitingMode = "adding" | "deleting" | "editing" | "none";

const NAME = "name";
const PART_PREFIX = "dm-item__";

const CANCEL_CLASS = "button-cancel";
const CONFIRM_CLASS = "button-confirm";

const BUTTON_CONFIRM_PART = (disabledPart: string) =>
  `${PART_PREFIX}button-action confirm${disabledPart}`;

const BUTTON_CANCEL_PART = (disabledPart: string) =>
  `${PART_PREFIX}button-action cancel${disabledPart}`;

const SELECT_OPTION_PART = `${PART_PREFIX}select-option`;

/**
 * @slot items - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling-item.scss",
  tag: "ch-next-data-modeling-item"
})
export class NextDataModelingSubitem implements ChComponent {
  /**
   * The metadata used for the different actions in the UI.
   */
  private actions: ActionsMetadataFunction = (
    captions: DataModelItemLabels,
    disabledPart: string
  ) => ({
    add: [
      {
        // Confirm add
        label: captions.confirm,
        class: CONFIRM_CLASS,
        part: BUTTON_CONFIRM_PART(disabledPart),
        event: this.confirmAction("new")
      },
      {
        // Cancel add
        label: captions.cancel,
        class: CANCEL_CLASS,
        part: BUTTON_CANCEL_PART(disabledPart),
        event: this.toggleShowNewField
      }
    ],

    delete: [
      {
        // Confirm delete
        label: captions.confirm,
        class: undefined,
        part: `${PART_PREFIX}button-delete-action confirm${disabledPart}`,
        event: this.emitDelete
      },
      {
        // Cancel delete
        label: captions.cancel,
        class: undefined,
        part: `${PART_PREFIX}button-delete-action cancel${disabledPart}`,
        event: this.toggleMode("delete")
      }
    ],
    edit: [
      {
        // Confirm edit
        label: captions.confirm,
        class: CONFIRM_CLASS,
        part: BUTTON_CONFIRM_PART(disabledPart),
        event: this.confirmAction("edit")
      },
      {
        // Cancel edit
        label: captions.cancel,
        class: CANCEL_CLASS,
        part: BUTTON_CANCEL_PART(disabledPart),
        event: this.toggleMode("edit")
      }
    ],
    normal: [
      {
        // Edit action
        label: captions.edit,
        class: "button-primary button-edit",
        part: `${PART_PREFIX}button-primary edit${disabledPart}`,
        event: this.toggleMode("edit")
      },
      {
        // Delete action
        label: captions.delete,
        class: "button-primary button-delete",
        part: `${PART_PREFIX}button-primary delete${disabledPart}`,
        event: this.toggleMode("delete")
      }
    ]
  });

  private errorName: string;
  private lastEditInfo: ItemInfo = { name: "", type: "ATT" };
  private focusInputInNextRender = false;

  // Refs
  private inputName: HTMLElement;
  private inputType: HTMLSelectElement;

  @Element() el: HTMLChNextDataModelingItemElement;

  @State() expanded = false;

  // Modes
  @State() errorType: ErrorType = "None";
  @State() waitingMode: WaitingMode = "none";

  /**
   * This attribute lets you specify if the actions in the `mode === "add"` are
   * visible.
   */
  @Prop() readonly actionsVisible: boolean = true;

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
  @Prop() readonly disabled: boolean = false;

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
   * This property specifies the defined field names of the entity parent.
   */
  @Prop() readonly fieldNames: string[] = [];

  /**
   * This property specifies at which collection level the field is located.
   */
  @Prop() readonly level: 0 | 1 | 2 = 1;

  /**
   * Determine the maximum amount of ATTs displayed per entity.
   */
  @Prop() readonly maxAtts: number = 3;

  /**
   * This attribute specifies the operating mode of the control
   */
  @Prop({ mutable: true }) mode: Mode = "normal";

  /**
   * The name of the field.
   */
  @Prop() readonly name: string = "";

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * `true` to show the new field button when `mode === "add"`
   */
  @Prop({ mutable: true }) showNewFieldBtn = true;

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
  @Event() editField: EventEmitter<ItemInfo>;

  /**
   * Fired when a new entity is committed to be added
   */
  @Event() newEntity: EventEmitter<EntityInfo>;

  /**
   * Fired when a new file is committed to be added when adding a new entity (level === 0)
   */
  @Event() firstNewField: EventEmitter<ItemInfo>;

  /**
   * Fired when the new field of the new entity tries to commits the adding
   * operation, but fails because it has errors
   */
  @Event() firstNewFieldErrors: EventEmitter;

  /**
   * Fired when a new file is committed to be added
   */
  @Event() newField: EventEmitter<ItemInfo>;

  @Listen("expandedChange")
  handleExpandedChange(event: CustomEvent) {
    event.stopPropagation();
  }

  @Listen("firstNewField")
  handleFirstNewField(event: CustomEvent<ItemInfo>) {
    if (this.level !== 0) {
      return;
    }
    this.confirmAction("new", "no", event.detail)(event);
  }

  @Listen("firstNewFieldErrors")
  handleFirstNewFieldErrors(event: CustomEvent<ItemInfo>) {
    this.confirmAction("new", "yes")(event);
  }

  /**
   * Set the adding mode for the first field of the entity.
   */
  @Method()
  async setAddingMode() {
    this.clearInput();
    this.waitingMode = "adding";
  }

  /**
   * Remove the value of the input when mode === "add" | "edit"
   */
  @Method()
  async clearInput() {
    if (this.inputName) {
      const inputRef = (this.inputName as HTMLElement).shadowRoot
        .firstElementChild as HTMLInputElement; // TODO: Improve typing
      inputRef.value = "";
    }

    this.errorType = "None";
  }

  /**
   * Check errors in the item when `level !== 0`
   */
  @Method()
  async checkErrors(
    errors: "yes" | "no" | "unknown",
    event: CustomEvent | UIEvent
  ) {
    this.confirmAction("new", errors)(event);
  }

  /**
   * Deletes the field.
   */
  @Method()
  async delete(event: UIEvent) {
    this.emitDelete(event);
  }

  /**
   * Hides the waiting mode to continue editing the field.
   */
  @Method()
  async hideWaitingMode() {
    if (this.mode === "add" && this.level === 0) {
      const entityItem = this.el.firstElementChild
        .firstElementChild as HTMLChNextDataModelingItemElement;
      entityItem.hideWaitingMode();
    }
    // The add mode should not be changed
    else if (this.mode !== "add") {
      this.mode = "normal";
    }
    this.waitingMode = "none";
  }

  /**
   * Returns:
   *   @example ```(Scorer, Goals)```
   *   @example ```(Name, Age, Nationality (+3))```
   */
  private makeAttsPrettier = (atts: string[], maxAtts) =>
    atts.length <= maxAtts
      ? "(" + atts.join(", ") + ")"
      : `(${atts.slice(0, maxAtts).join(", ")} (+${atts.length - maxAtts}))`;

  private emitDelete = (event: UIEvent) => {
    // The subitem is the last one of the parent. Delete the parent instead
    if (this.level !== 0 && this.fieldNames.length === 1) {
      const parentItem = this.el.parentElement
        .parentElement as HTMLChNextDataModelingItemElement;

      parentItem.delete(event);
      this.mode = "normal";
      return;
    }

    event.stopPropagation();
    this.waitingMode = "deleting";
    this.deleteField.emit();
  };

  private toggleMode = (mode: Mode) => (event: CustomEvent | UIEvent) => {
    event.stopPropagation();
    this.mode = this.mode === "normal" ? mode : "normal";

    this.focusInputInNextRender = mode === "edit";
  };

  private toggleShowNewField = (event: CustomEvent | UIEvent) => {
    event.stopPropagation();
    this.errorType = "None";
    const showNewFieldBtn = !this.showNewFieldBtn;

    this.showNewFieldBtn = showNewFieldBtn;
    this.focusInputInNextRender = !showNewFieldBtn;

    if (!showNewFieldBtn && this.level === 0) {
      const entityItem = this.el.firstElementChild
        .firstElementChild as HTMLChNextDataModelingItemElement;
      entityItem.clearInput();
    }
  };

  /**
   * @todo TODO: Improve typing
   * WA function to get the gx-edit's input value
   * @param editElement An HTMLGxEditElement that is implemented in the web-controls-library
   */
  private getGxEditInputValue = (editElement: HTMLElement) =>
    (editElement.shadowRoot.firstElementChild as HTMLInputElement).value;

  private handleKeyDown =
    (actionType: "edit" | "new") => (event: KeyboardEvent) => {
      if (event.code !== KEY_CODES.ENTER) {
        return;
      }
      event.preventDefault();

      this.confirmAction(actionType)(event);
    };

  private checkChildErrors = (
    errors: "yes" | "no" | "unknown",
    event: CustomEvent | UIEvent
  ) => {
    (
      this.el.firstElementChild
        .firstElementChild as HTMLChNextDataModelingItemElement
    ).checkErrors(errors, event);
  };

  private validateErrorsWhenAddingEntity = (
    actionType: "edit" | "new",
    errors: "yes" | "no" | "unknown" = "unknown",
    event: CustomEvent | UIEvent
  ) => {
    // Validate child errors when adding a new entity
    if (this.level === 0 && actionType === "new" && errors === "unknown") {
      this.checkChildErrors(errors, event);
    }
    // Validate parent errors when adding a new field in the new entity
    else if (!this.actionsVisible && errors === "unknown") {
      this.firstNewFieldErrors.emit();
    }
  };

  private confirmAction =
    (
      actionType: "edit" | "new",
      errors: "yes" | "no" | "unknown" = "unknown",
      itemInfo: ItemInfo = null
    ) =>
    (event: CustomEvent | UIEvent) => {
      event.stopPropagation();
      const trimmedInput = this.getGxEditInputValue(this.inputName).trim();

      // Force re-render. Useful when the error type don't change but the
      // displayed error text must change
      this.errorType = "None";

      if (trimmedInput === "") {
        this.errorType = "Empty";

        this.validateErrorsWhenAddingEntity(actionType, errors, event);
        return;
      }

      // The field already exists
      if (
        this.name !== trimmedInput &&
        this.fieldNames.includes(trimmedInput)
      ) {
        this.errorType = "AlreadyDefined";
        this.errorName = trimmedInput;

        this.validateErrorsWhenAddingEntity(actionType, errors, event);
        return;
      }

      // New field
      if (actionType === "new") {
        this.lastEditInfo = {
          name: trimmedInput,
          type:
            this.level === 0 ? "ATT" : (this.inputType.value as EntityItemType) // Doesn't matter the type when level = 0
        };

        // Adding a entity
        if (this.level === 0) {
          // Must check child errors
          if (errors === "unknown") {
            this.checkChildErrors(errors, event);
          }
          // The child does not have errors, commit the new entity
          else if (errors === "no") {
            this.waitingMode = "adding";
            this.expanded = true;
            this.newEntity.emit({ name: trimmedInput, level: [itemInfo] });
            this.toggleShowNewField(event);

            (
              this.el.firstElementChild
                .firstElementChild as HTMLChNextDataModelingItemElement
            ).setAddingMode(); // TODO: Improve typing
          }
        }
        // Normal case: Adding a field that is not the first field of the entity
        else if (this.actionsVisible) {
          this.waitingMode = "adding";
          this.newField.emit(this.lastEditInfo);
          this.toggleShowNewField(event);
        }
        // Adding a field that is the first field of the entity
        else {
          this.firstNewField.emit(this.lastEditInfo);
        }

        return;
      }

      // Edit field (level 0 fields don't have a type, because they are always entities)
      if (
        this.name !== trimmedInput ||
        (this.level !== 0 && this.type !== this.inputType.value)
      ) {
        this.waitingMode = "editing";

        this.lastEditInfo = {
          name: trimmedInput,
          type:
            this.level === 0 ? "ATT" : (this.inputType.value as EntityItemType) // Doesn't matter the type when level = 0
        };
        this.editField.emit(this.lastEditInfo);
      }

      this.toggleMode("edit")(event);
    };

  private loading = () => (
    <svg class="waiting-mode__loading" height="28" viewBox="6 6 12 12">
      <circle cx="12" cy="12" r="4" stroke-width="1.125"></circle>
    </svg>
  );

  private errorText = (errorTexts: { [key in ErrorText]: string }) => (
    <p class="error-text" part={`${PART_PREFIX}error-text`}>
      {this.errorType === "Empty"
        ? errorTexts.Empty
        : [
            this.level === 0
              ? errorTexts.AlreadyDefinedEntity1
              : errorTexts.AlreadyDefined1,
            <span part={`${PART_PREFIX}error-text-name`}>
              {this.errorName}
            </span>,
            errorTexts.AlreadyDefined2
          ]}
    </p>
  );

  private readonlyContent = (
    captions: DataModelItemLabels,
    name: string,
    type: EntityItemType
  ) => [
    // Readonly
    <h1
      id={NAME}
      class={{
        name: true,
        "name-entity": type === "ENTITY"
      }}
      part={`${PART_PREFIX}name`}
    >
      {name}
    </h1>,

    this.level !== 0 && type !== "ATT" && (
      <span
        class="type"
        part={
          type === "LEVEL" ? `${PART_PREFIX}collection` : `${PART_PREFIX}entity`
        }
      >
        {type === "LEVEL"
          ? captions.collection
          : this.makeAttsPrettier(
              this.entityNameToATTs[this.dataType] || [],
              this.maxAtts
            )}
      </span>
    )
  ];

  private editableContent = (
    actionType: "new" | "edit",
    captions: DataModelItemLabels,
    disabledPart: string,
    errorPart: string
  ) => [
    // Editable
    <gx-edit
      class="field-name"
      part={`${PART_PREFIX}input${errorPart}${disabledPart}`}
      disabled={this.disabled}
      type="text"
      value={this.name}
      ref={el => (this.inputName = el as HTMLElement)}
      onKeydown={this.handleKeyDown(actionType)}
    ></gx-edit>,

    this.level !== 0 && (
      <div class="select-wrapper">
        <select
          class="select"
          part={`${PART_PREFIX}input${disabledPart} select`}
          disabled={this.disabled}
          ref={el => (this.inputType = el)}
        >
          <option
            part={SELECT_OPTION_PART}
            value={"ATT" as EntityItemType}
            selected={this.type === "ATT"}
          >
            {captions.ATT}
          </option>

          <option
            part={SELECT_OPTION_PART}
            value={"ENTITY" as EntityItemType}
            selected={this.type === "ENTITY"}
          >
            {captions.ENTITY}
          </option>

          <option
            part={SELECT_OPTION_PART}
            value={"LEVEL" as EntityItemType}
            selected={this.type === "LEVEL"}
          >
            {captions.LEVEL}
          </option>
        </select>
      </div>
    ),

    this.errorType !== "None" && this.errorText(this.errorTexts)
  ];

  private newFieldMode = (
    captions: DataModelItemLabels,
    errorPart: string,
    disabledPart: string,
    actions: ActionMetadata[]
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
      <div
        slot={this.level === 0 ? "header" : undefined}
        class={{
          [`add-new-field--level-${this.level}`]: true,
          "add-new-field--no-actions": !this.actionsVisible
        }}
        part={`${PART_PREFIX}header-content`}
        tabindex={this.level !== 0 && this.actionsVisible ? "0" : undefined}
      >
        {this.level === 2 && (
          <div
            aria-hidden="true"
            class="sub-field"
            part={`${PART_PREFIX}sub-field`}
          ></div>
        )}

        <h1 class="name" part={`${PART_PREFIX}name`}>
          {this.level === 0 ? captions.newEntity : captions.newField}
        </h1>

        {this.editableContent("new", captions, disabledPart, errorPart)}

        {this.level === 0 && <slot />}

        {this.actionsVisible && [
          <button
            aria-label={actions[0].label}
            class={actions[0].class}
            part={actions[0].part}
            disabled={this.disabled}
            type="button"
            onClick={actions[0].event}
          ></button>,

          <button
            aria-label={actions[1].label}
            class={actions[1].class}
            part={actions[1].part}
            disabled={this.disabled}
            type="button"
            onClick={actions[1].event}
          ></button>
        ]}
      </div>
    );

  private normalMode = (
    captions: DataModelItemLabels,
    errorPart: string,
    disabledPart: string,
    waitingModePart: string,
    actions: ActionMetadata[],
    showWaitingModeTexts: boolean
  ) => [
    <div
      slot={this.level === 0 ? "header" : undefined}
      class={{
        header: true,
        "edit-mode": this.mode === "edit"
      }}
      part={`${PART_PREFIX}header-content ${
        this.level !== 0 ? this.type.toLowerCase() : ""
      }`}
      tabindex={this.level !== 0 ? "0" : undefined}
    >
      {this.level === 2 && (
        <div
          aria-hidden="true"
          class="sub-field"
          part={`${PART_PREFIX}sub-field`}
        ></div>
      )}

      {this.mode === "edit"
        ? this.editableContent("edit", captions, disabledPart, errorPart)
        : this.readonlyContent(
            captions,
            showWaitingModeTexts ? this.lastEditInfo.name : this.name,
            showWaitingModeTexts ? this.lastEditInfo.type : this.type
          )}

      {!this.readonly && this.actionsVisible && (
        <div
          class={{
            "delete-mode": this.mode === "delete",
            optimization: this.mode !== "delete",
            "waiting-mode": this.waitingMode !== "none"
          }}
          part={`${PART_PREFIX}delete-mode${waitingModePart}`}
        >
          {this.waitingMode === "none"
            ? [
                this.mode === "delete" && captions.deleteMode, // Delete Mode

                <button
                  aria-label={actions[0].label}
                  class={actions[0].class}
                  part={actions[0].part}
                  disabled={this.disabled}
                  type="button"
                  onClick={actions[0].event}
                ></button>,

                <button
                  aria-label={actions[1].label}
                  class={actions[1].class}
                  part={actions[1].part}
                  disabled={this.disabled}
                  type="button"
                  onClick={actions[1].event}
                ></button>
              ]
            : [captions[this.waitingMode], this.loading()]}
        </div>
      )}
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

  componentDidUpdate() {
    // Focus the edit input when the render method has finished
    if (this.focusInputInNextRender && this.inputName) {
      this.focusInputInNextRender = false;

      // Wait until the gx-edit control has render
      requestAnimationFrame(() => {
        this.inputName.click(); // The click method focuses the inner input of the gx-edit
      });
    }
  }

  render() {
    // Parts
    const disabledPart = this.disabled ? " disabled" : "";
    const waitingModePart =
      this.waitingMode === "none" ? "" : ` ${PART_PREFIX}waiting-mode`;
    const errorPart = this.errorType !== "None" ? " error" : "";

    const captions = this.captions;
    const actions = this.actions(captions, disabledPart)[this.mode];

    const showWaitingModeTexts =
      this.waitingMode === "editing" || this.waitingMode === "adding";

    return (
      <Host
        role="listitem"
        aria-labelledby={NAME}
        class={{
          "gx-disabled": this.disabled
        }}
      >
        {
          // Add new field layout (last cell of the collection/entity)
          this.mode === "add" && this.waitingMode !== "adding" ? (
            this.newFieldMode(captions, errorPart, disabledPart, actions)
          ) : this.level === 0 ? ( // Normal mode. Level === 0
            <ch-accordion
              class="accordion"
              part={`${PART_PREFIX}accordion`}
              accessibleName={this.name}
              expanded={this.expanded}
              exportparts={`accordion__chevron:${PART_PREFIX}chevron,accordion__expandable:${PART_PREFIX}expandable,accordion__header:${PART_PREFIX}header`}
            >
              {this.normalMode(
                captions,
                errorPart,
                disabledPart,
                waitingModePart,
                actions,
                showWaitingModeTexts
              )}
            </ch-accordion>
          ) : (
            // Normal mode. Level !== 0
            this.normalMode(
              captions,
              errorPart,
              disabledPart,
              waitingModePart,
              actions,
              showWaitingModeTexts
            )
          )
        }
      </Host>
    );
  }
}
