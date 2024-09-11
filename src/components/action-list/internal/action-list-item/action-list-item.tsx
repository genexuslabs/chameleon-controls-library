import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  ActionListItemAdditionalAction,
  ActionListItemAdditionalBase,
  ActionListItemAdditionalCustom,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalInformationSection,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalItemActionType,
  ActionListItemAdditionalModel
} from "../../types";
import { renderImg } from "../../../../common/renders";
import {
  ACTION_LIST_ITEM_EXPORT_PARTS,
  ACTION_LIST_ITEM_PARTS_DICTIONARY,
  ACTION_LIST_PARTS_DICTIONARY,
  imageTypeDictionary,
  KEY_CODES,
  startPseudoImageTypeDictionary
} from "../../../../common/reserved-names";
import {
  ActionListCaptionChangeEventDetail,
  ActionListFixedChangeEventDetail,
  ActionListItemActionTypeBlockInfo
} from "./types";
import { tokenMap } from "../../../../common/utils";
import { computeExportParts } from "./compute-exportparts";
import { computeActionTypeBlocks } from "./compute-editing-sections";
import { ActionListTranslations } from "../../translations";

const ACTION_TYPE_PARTS = {
  fix: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_FIX,
  modify: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_MODIFY,
  remove: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_REMOVE,
  custom: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_CUSTOM
} as const;

@Component({
  tag: "ch-action-list-item",
  styleUrl: "action-list-item.scss",
  shadow: { delegatesFocus: true }
})
export class ChActionListItem {
  #additionalItemListenerDictionary = {
    fix: () =>
      this.fixedChange.emit({ itemId: this.el.id, value: !this.fixed }),
    remove: () => {
      if (!this.editing) {
        this.deleting = true;
      }
    },
    custom: callback => callback(),
    modify: () => {
      if (!this.deleting) {
        this.editing = true;
      }
    }
  } satisfies {
    [key in ActionListItemAdditionalItemActionType["type"]]: (...args) => any;
  };

  #confirmActionsDictionary = {
    custom: () => this.translations.confirm,
    modify: () => this.translations.confirmModify,
    remove: () => this.translations.confirmDelete
  } satisfies {
    [key in Exclude<
      ActionListItemAdditionalItemActionType["type"],
      "fix"
    >]: () => string;
  };

  #cancelActionsDictionary = {
    custom: () => this.translations.cancel,
    modify: () => this.translations.cancelModify,
    remove: () => this.translations.cancelDelete
  } satisfies {
    [key in Exclude<
      ActionListItemAdditionalItemActionType["type"],
      "fix"
    >]: () => string;
  };

  #editingSections: ActionListItemActionTypeBlockInfo[] | undefined;
  #deletingSections: ActionListItemActionTypeBlockInfo[] | undefined;

  // Refs
  #headerRef!: HTMLButtonElement;
  #inputRef: HTMLChEditElement | undefined;

  @Element() el: HTMLChActionListItemElement;

  /**
   *
   */
  @Prop() readonly additionalInfo?: ActionListItemAdditionalInformation;
  @Watch("additionalInfo")
  additionalInfoChanged() {
    this.#setExportParts();
    this.#setActionTypeBlocks();
  }

  /**
   * This attributes specifies the caption of the control.
   */
  @Prop() readonly caption: string;

  /**
   * Set this attribute if you want display a checkbox in the control.
   */
  @Prop() readonly checkbox: boolean = false;

  /**
   * Set this attribute if you want the checkbox to be checked by default.
   * Only works if `checkbox = true`
   */
  @Prop({ reflect: true, mutable: true }) checked = false;

  /**
   * Set this attribute if you want to set a custom render for the control, by
   * passing a slot.
   */
  @Prop() readonly customRender: boolean = false;

  /**
   * Set this property when the control is in delete mode.
   */
  @Prop({ mutable: true }) deleting = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @Prop({ mutable: true }) downloading = false;

  /**
   * This property lets you specify if the edit operation is enabled in the
   * control. If `true`, the control can edit its caption in place.
   */
  @Prop() readonly editable: boolean;

  /**
   * Set this property when the control is in edit mode.
   */
  @Prop({ mutable: true }) editing = false;

  /**
   *
   */
  @Prop() readonly fixed?: boolean = false;

  /**
   * `true` if the checkbox's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate = false;

  /**
   * This attribute represents additional info for the control that is included
   * when dragging the item.
   */
  @Prop() readonly metadata: string;

  /**
   * Specifies if the item is inside of a ch-action-list-group control.
   */
  @Prop() readonly nested: boolean = false;

  /**
   * Specifies if the item is inside of a ch-action-list-group control that
   * is expandable.
   */
  @Prop() readonly nestedExpandable: boolean = false;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @Prop() readonly parts?: string;
  // @Watch("parts")
  // partsChanged(newParts: string) {
  //   this.#setExportParts(newParts);
  // }

  /**
   * Specifies if the item can be selected.
   */
  @Prop() readonly selectable: boolean = false;

  /**
   * This attribute lets you specify if the item is selected
   */
  @Prop() readonly selected: boolean = false;

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @Prop() readonly showDownloadingSpinner: boolean = true;

  /**
   * Specifies the literals required for the control.
   */
  @Prop() readonly translations!: ActionListTranslations;

  // /**
  //  * Fired when the checkbox value of the control is changed.
  //  */
  // @Event() checkboxChange: EventEmitter<TreeViewItemCheckedInfo>;

  // /**
  //  * Fired when the item is being dragged.
  //  */
  // @Event() itemDragStart: EventEmitter<TreeViewItemDragStartInfo>;

  /**
   * Fired when the fixed value of the control is changed.
   */
  @Event({ composed: true })
  captionChange: EventEmitter<ActionListCaptionChangeEventDetail>;

  /**
   * Fired when the control is asking to modify its caption
   */
  // TODO: Unify terms (modifyCaption in the Tree View)
  @Event({ composed: true })
  fixedChange: EventEmitter<ActionListFixedChangeEventDetail>;

  /**
   * Fired when the remove button was clicked in the control.
   */
  @Event({ composed: true }) remove: EventEmitter<string>;

  /**
   * Fired when the item is no longer being dragged.
   */
  @Event() itemDragEnd: EventEmitter;

  #removeEditMode =
    (shouldFocusHeader: boolean, commitEdition = false) =>
    () => {
      // When pressing the enter key in the input, the removeEditMode event is
      // triggered twice (due to the headerRef.focus() triggering the onBlur
      // event in the input), so we need to check if the edit mode was disabled
      if (!this.editing) {
        return;
      }
      this.editing = false;

      const newCaption = this.#inputRef.value;

      if (
        commitEdition &&
        newCaption.trim() !== "" &&
        this.caption !== newCaption
      ) {
        this.captionChange.emit({
          itemId: this.el.id,
          newCaption: newCaption
        });
      }

      if (shouldFocusHeader) {
        this.#headerRef.focus();
      }
    };

  #checkIfShouldRemoveEditMode = (event: KeyboardEvent) => {
    event.stopPropagation();

    if (event.code !== KEY_CODES.ENTER && event.code !== KEY_CODES.ESCAPE) {
      return;
    }

    event.preventDefault();
    const commitEdition = event.code === KEY_CODES.ENTER;
    this.#removeEditMode(true, commitEdition)();
  };

  #renderAdditionalItems = (additionalItems: ActionListItemAdditionalItem[]) =>
    additionalItems.map(item =>
      (item as ActionListItemAdditionalCustom).jsx
        ? (item as ActionListItemAdditionalCustom).jsx()
        : this.#renderAdditionalItem(
            item as
              | ActionListItemAdditionalBase
              | ActionListItemAdditionalAction
          )
    );

  #renderAdditionalItem = (
    item: ActionListItemAdditionalBase | ActionListItemAdditionalAction
  ) => {
    const additionalAction = item as ActionListItemAdditionalAction;
    const hasImage = !!item.imageSrc;
    const hasPseudoImage = hasImage && item.imageType !== "background";
    const pseudoImageStartClass = hasPseudoImage
      ? startPseudoImageTypeDictionary[item.imageType ?? "background"]
      : null;
    const imageTag =
      hasImage &&
      renderImg(
        "img",
        item.part
          ? `${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM} ${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE} ${item.part}`
          : `${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM} ${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE}`,
        item.imageSrc,
        item.imageType
      );

    const action = additionalAction.action;

    // Button
    if (action) {
      const actionTypeIsFix = action.type === "fix";
      const actionTypeIsCustom = action.type === "custom";

      return (
        <button
          key={additionalAction.id}
          aria-label={additionalAction.accessibleName}
          class={{
            "additional-item": true,
            [pseudoImageStartClass]: hasPseudoImage && actionTypeIsCustom,
            "show-on-mouse-hover":
              (actionTypeIsFix && !this.fixed) ||
              (!actionTypeIsFix && action.showOnHover),
            [action.type]: true,
            fixed: actionTypeIsFix && this.fixed,
            "not-fixed": actionTypeIsFix && !this.fixed
          }}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ACTION]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
              this.selectable && this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              this.selectable && !this.selected,

            [ACTION_TYPE_PARTS[action.type] satisfies string]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.FIXED]:
              actionTypeIsFix && this.fixed,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_FIXED]:
              actionTypeIsFix && !this.fixed,

            [item.part]: !!item.part
          })}
          style={
            hasPseudoImage && actionTypeIsCustom
              ? { "--ch-start-img": `url(${item.imageSrc})` }
              : null
          }
          disabled={this.disabled}
          type="button"
          onClick={
            !this.disabled
              ? this.#handleAdditionalItemClick(
                  action.type,
                  actionTypeIsCustom ? action.callback : undefined
                )
              : undefined
          }
        >
          {actionTypeIsCustom && imageTag}
          {item.caption && item.caption}
        </button>
      );
    }

    // Span
    if (item.caption) {
      return (
        <span
          key={additionalAction.id ?? null}
          class={{
            "additional-item": true,
            [pseudoImageStartClass]: !!pseudoImageStartClass
          }}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_TEXT]: true,

            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
              this.selectable && this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              this.selectable && !this.selected,

            [item.part]: !!item.part
          })}
          style={
            hasPseudoImage
              ? { "--ch-start-img": `url(${item.imageSrc})` }
              : null
          }
        >
          {imageTag}
          {item.caption}
        </span>
      );
    }

    // Div with background or mask
    if (hasPseudoImage) {
      return (
        <div
          aria-hidden="true"
          class={`additional-item ${
            imageTypeDictionary[item.imageType ?? "background"]
          }`}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE]: true,

            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
              this.selectable && this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              this.selectable && !this.selected,

            [item.part]: !!item.part
          })}
          style={{ "--ch-img": `url(${item.imageSrc})` }}
        ></div>
      );
    }

    // Img
    if (hasImage) {
      return imageTag; // TODO: Add the "additional-item" class
    }

    return undefined;
  };

  #handleAdditionalItemClick =
    (
      type: ActionListItemAdditionalItemActionType["type"],
      callback?: (id: string) => void
    ) =>
    (event: MouseEvent) => {
      event.stopPropagation();

      if (callback) {
        callback(this.el.id);
      } else {
        this.#additionalItemListenerDictionary[
          // Only "custom" type has callbacks
          type as Exclude<
            ActionListItemAdditionalItemActionType["type"],
            "custom"
          >
        ]();
      }
    };

  #setExportParts = () => {
    let exportParts: string | undefined = undefined;

    if (this.additionalInfo) {
      const parts = computeExportParts(this.additionalInfo);

      // Additional parts
      if (parts.size > 0) {
        exportParts = `${ACTION_LIST_ITEM_EXPORT_PARTS},${Array.from(
          parts
        ).join(",")}`;
      }
    }

    this.el.setAttribute(
      "exportparts",
      exportParts ?? ACTION_LIST_ITEM_EXPORT_PARTS
    );
  };

  #setActionTypeBlocks = () => {
    this.#deletingSections = computeActionTypeBlocks(
      "remove",
      this.additionalInfo
    );
    this.#editingSections = computeActionTypeBlocks(
      "modify",
      this.additionalInfo
    );
  };

  #renderAdditionalInfo = (
    additionalModel: ActionListItemAdditionalModel,
    zoneName: ActionListItemAdditionalInformationSection,
    stretch = false
  ) => {
    if (!additionalModel) {
      return;
    }

    const zoneNameWithPrefix = `item__${zoneName}` as const;

    let actionTypeSection:
      | Exclude<ActionListItemAdditionalItemActionType["type"], "fix">
      | undefined;
    let actionTypeAligns = undefined;

    // Editing
    if (
      this.editing &&
      this.#editingSections !== undefined &&
      this.#editingSections.some(
        editingSection => editingSection.section === zoneName
      )
    ) {
      actionTypeSection = "modify";
      actionTypeAligns = this.#editingSections.find(
        editingSection => editingSection.section === zoneName
      ).align;
    }
    // Deleting
    else if (
      this.deleting &&
      this.#deletingSections !== undefined &&
      this.#deletingSections.some(
        deletingSection => deletingSection.section === zoneName
      )
    ) {
      actionTypeSection = "remove";
      actionTypeAligns = this.#deletingSections.find(
        deletingSection => deletingSection.section === zoneName
      ).align;
    }

    return (
      <div
        key={zoneNameWithPrefix}
        class={`align-container ${zoneName}`}
        part={zoneNameWithPrefix}
      >
        {additionalModel.start && (
          <div
            key={`${zoneNameWithPrefix}-start`}
            class={stretch ? "align-start valign-start" : "align-start"}
            part={`${zoneNameWithPrefix} start`}
          >
            {actionTypeSection && actionTypeAligns.includes("start")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.start)}
          </div>
        )}
        {additionalModel.center && (
          <div
            key={`${zoneNameWithPrefix}-center`}
            class={stretch ? "align-center valign-center" : "align-center"}
            part={`${zoneNameWithPrefix} center`}
          >
            {actionTypeSection && actionTypeAligns.includes("center")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.center)}
          </div>
        )}
        {additionalModel.end && (
          <div
            key={`${zoneNameWithPrefix}-end`}
            class={stretch ? "align-end valign-end" : "align-end"}
            part={`${zoneNameWithPrefix} end`}
          >
            {actionTypeSection && actionTypeAligns.includes("end")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.end)}
          </div>
        )}
      </div>
    );
  };

  #renderConfirmCancelButtons = (
    action: Exclude<ActionListItemAdditionalItemActionType["type"], "fix">
  ) => [
    <button
      aria-label={this.#confirmActionsDictionary[action]()}
      title={this.#confirmActionsDictionary[action]()}
      class="confirm-action"
      part={tokenMap({
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM_CONFIRM]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_ACCEPT]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
          this.selectable && this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
          this.selectable && !this.selected
      })}
      disabled={this.disabled}
      type="button"
      onClick={!this.disabled ? this.#acceptAction(action) : undefined}
    ></button>,

    <button
      aria-label={this.#cancelActionsDictionary[action]()}
      title={this.#cancelActionsDictionary[action]()}
      class="cancel-action"
      part={tokenMap({
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM_CONFIRM]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_CANCEL]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
          this.selectable && this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
          this.selectable && !this.selected
      })}
      disabled={this.disabled}
      type="button"
      onClick={!this.disabled ? this.#cancelAction : undefined}
    ></button>
  ];

  #acceptAction =
    (action: ActionListItemAdditionalItemActionType["type"]) =>
    (event: PointerEvent) => {
      event.stopPropagation();

      if (action === "modify") {
        this.#removeEditMode(true, true)();
      } else if (action === "remove") {
        this.remove.emit(this.el.id);
      }
    };

  #cancelAction = (event: PointerEvent) => {
    event.stopPropagation();

    this.editing = false;
    this.deleting = false;
  };

  connectedCallback() {
    this.el.setAttribute("role", "listitem");
    this.el.setAttribute("part", ACTION_LIST_PARTS_DICTIONARY.ITEM);
    this.#setExportParts();
    this.#setActionTypeBlocks();
  }

  render() {
    const additionalInfo = this.additionalInfo;
    const hasAdditionalInfo = !!this.additionalInfo;

    const stretchStart = hasAdditionalInfo && additionalInfo["stretch-start"];
    const blockStart = hasAdditionalInfo && additionalInfo["block-start"];
    const inlineCaption = hasAdditionalInfo && additionalInfo["inline-caption"];
    const blockEnd = hasAdditionalInfo && additionalInfo["block-end"];
    const stretchEnd = hasAdditionalInfo && additionalInfo["stretch-end"];

    const hasParts = !!this.parts;

    return (
      <Host aria-selected={this.selectable && this.selected ? "true" : null}>
        <button
          class="action"
          disabled={this.disabled}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED]: this.nested,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED_EXPANDABLE]:
              this.nestedExpandable,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTABLE]: this.selectable,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTABLE]:
              !this.selectable,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
              this.selectable && this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              this.selectable && !this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
          type="button"
          ref={el => (this.#headerRef = el)}
        >
          {this.#renderAdditionalInfo(stretchStart, "stretch-start", true)}
          {this.#renderAdditionalInfo(blockStart, "block-start")}

          <div
            key="item__inline-caption"
            class="align-container inline-caption"
            part={tokenMap({
              "item__inline-caption": true,

              [ACTION_LIST_ITEM_PARTS_DICTIONARY.EDITING]: this.editing,
              [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_EDITING]: !this.editing
            })}
          >
            {this.editing ? (
              <ch-edit
                autoFocus
                part={
                  hasParts
                    ? `${ACTION_LIST_ITEM_PARTS_DICTIONARY.EDIT_CAPTION} ${this.parts}`
                    : ACTION_LIST_ITEM_PARTS_DICTIONARY.EDIT_CAPTION
                }
                disabled={this.disabled}
                value={this.caption}
                onKeyDown={
                  !this.disabled ? this.#checkIfShouldRemoveEditMode : undefined
                }
                ref={el => (this.#inputRef = el)}
              ></ch-edit>
            ) : (
              this.caption && (
                <span part={ACTION_LIST_ITEM_PARTS_DICTIONARY.CAPTION}>
                  {this.caption}
                </span>
              )
            )}

            {inlineCaption && [
              inlineCaption.start && (
                <div
                  key="item__inline-caption-start"
                  class="align-start"
                  part="item__inline-caption start"
                >
                  {this.#renderAdditionalItems(inlineCaption.start)}
                </div>
              ),
              inlineCaption.end && (
                <div
                  key="item__inline-caption-end"
                  class="align-end"
                  part="item__inline-caption end"
                >
                  {this.#renderAdditionalItems(inlineCaption.end)}
                </div>
              )
            ]}
          </div>

          {this.#renderAdditionalInfo(blockEnd, "block-end")}
          {this.#renderAdditionalInfo(stretchEnd, "stretch-end")}
        </button>
      </Host>
    );
  }
}
