import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { ref, createRef, type Ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

import type {
  ActionListImagePathCallback,
  ActionListItemAdditionalAction,
  ActionListItemAdditionalBase,
  ActionListItemAdditionalCustom,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalInformationSection,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalItemActionType,
  ActionListItemAdditionalModel
} from "../../types";
import {
  ACTION_LIST_ITEM_EXPORT_PARTS,
  ACTION_LIST_ITEM_PARTS_DICTIONARY,
  ACTION_LIST_PARTS_DICTIONARY,
  imageTypeDictionary,
  startPseudoImageTypeDictionary
} from "../../../../utilities/reserved-names/reserved-names";
import { KEY_CODES } from "../../../../utilities/reserved-names/key-codes";
import type {
  ActionListCaptionChangeEventDetail,
  ActionListFixedChangeEventDetail,
  ActionListItemActionTypeBlockInfo
} from "./types";
import { tokenMap } from "../../../../utilities/mapping/token-map";
import { updateDirectionInImageCustomVar } from "../../../../utilities/multi-state-icons";
import { computeExportParts } from "./compute-exportparts";
import { computeActionTypeBlocks } from "./compute-editing-sections";
import type { ActionListTranslations } from "../../translations";
import type {
  GxImageMultiState,
  GxImageMultiStateStart
} from "../../../../typings/multi-state-images";
import { getControlRegisterProperty } from "../../../../utilities/register-properties/registry-properties";

import styles from "./action-list-item.scss?inline";

const DEFAULT_GET_IMAGE_PATH_CALLBACK: ActionListImagePathCallback = () =>
  undefined;

const ACTION_TYPE_PARTS = {
  fix: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_FIX,
  modify: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_MODIFY,
  remove: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_REMOVE,
  custom: ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_CUSTOM
} as const;

/**
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-action-list-item",
  shadow: { delegatesFocus: true }
})
export class ChActionListItem extends KasstorElement {
  #additionalItemListenerDictionary = {
    fix: () =>
      this.fixedChange.emit({ itemId: this.id, value: !this.fixed }),
    remove: () => {
      if (!this.editing) {
        this.deleting = true;
      }
    },
    custom: (callback: (id: string) => void) => callback(this.id),
    modify: () => {
      if (!this.deleting) {
        this.editing = true;
      }
    }
  } satisfies {
    [key in ActionListItemAdditionalItemActionType["type"]]: (
      ...args: any[]
    ) => any;
  };

  #confirmActionsDictionary = {
    // custom: () => this.translations.confirm,
    modify: () => this.translations!.confirmModify,
    remove: () => this.translations!.confirmDelete
  } satisfies {
    [key in Exclude<
      ActionListItemAdditionalItemActionType["type"],
      "fix" | "custom"
    >]: () => string;
  };

  #cancelActionsDictionary = {
    // custom: () => this.translations.cancel,
    modify: () => this.translations!.cancelModify,
    remove: () => this.translations!.cancelDelete
  } satisfies {
    [key in Exclude<
      ActionListItemAdditionalItemActionType["type"],
      "fix" | "custom"
    >]: () => string;
  };

  #editingSections: ActionListItemActionTypeBlockInfo[] | undefined;
  #deletingSections: ActionListItemActionTypeBlockInfo[] | undefined;

  // Refs
  #headerRef: Ref<HTMLButtonElement> = createRef();
  #inputRef: Ref<HTMLElement> = createRef();

  /**
   *
   */
  @property({ attribute: false })
  additionalInfo: ActionListItemAdditionalInformation | undefined;
  @Observe("additionalInfo")
  protected additionalInfoChanged() {
    this.#setExportParts();
    this.#setActionTypeBlocks();
  }

  /**
   * This attributes specifies the caption of the control.
   */
  @property({ attribute: false }) caption: string | undefined;

  /**
   * Set this attribute if you want display a checkbox in the control.
   */
  @property({ type: Boolean }) checkbox: boolean = false;

  /**
   * Set this attribute if you want the checkbox to be checked by default.
   * Only works if `checkbox = true`
   */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  /**
   * Set this attribute if you want to set a custom render for the control, by
   * passing a slot.
   */
  @property({ type: Boolean, attribute: "custom-render" })
  customRender: boolean = false;

  /**
   * Set this property when the control is in delete mode.
   */
  @state() deleting: boolean = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @state() downloading: boolean = false;

  /**
   * This property lets you specify if the edit operation is enabled in the
   * control. If `true`, the control can edit its caption in place.
   */
  @property({ attribute: false }) editable: boolean | undefined;

  /**
   * Set this property when the control is in edit mode.
   */
  @state() editing: boolean = false;

  /**
   *
   */
  @property({ attribute: false }) fixed: boolean | undefined = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * imgSrc needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | ((item: ActionListItemAdditionalBase) => GxImageMultiState | undefined)
    | undefined;

  /**
   * `true` if the checkbox's value is indeterminate.
   */
  @state() indeterminate: boolean = false;

  /**
   * This attribute represents additional info for the control that is included
   * when dragging the item.
   */
  @property({ attribute: false }) metadata: string | undefined;

  /**
   * Specifies if the item is inside of a ch-action-list-group control.
   */
  @property({ attribute: false }) nested: boolean = false;

  /**
   * Specifies if the item is inside of a ch-action-list-group control that
   * is expandable.
   */
  @property({ attribute: false }) nestedExpandable: boolean = false;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @property({ attribute: false }) parts: string | undefined;
  // @Watch("parts")
  // partsChanged(newParts: string) {
  //   this.#setExportParts(newParts);
  // }

  /**
   * Specifies if the item can be selected.
   */
  @property({ attribute: false }) selectable: boolean = false;

  /**
   * This attribute lets you specify if the item is selected
   */
  @property({ attribute: false }) selected: boolean = false;

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @property({ type: Boolean, attribute: "show-downloading-spinner" })
  showDownloadingSpinner: boolean = true;

  /**
   * Specifies the literals required for the control.
   */
  @property({ attribute: false }) translations: ActionListTranslations | undefined;

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
  captionChange!: EventEmitter<ActionListCaptionChangeEventDetail>;

  /**
   * Fired when the control is asking to modify its caption
   */
  // TODO: Unify terms (modifyCaption in the Tree View)
  @Event({ composed: true })
  fixedChange!: EventEmitter<ActionListFixedChangeEventDetail>;

  /**
   * Fired when the remove button was clicked in the control.
   */
  @Event({ composed: true }) remove!: EventEmitter<string>;

  /**
   * Fired when the item is no longer being dragged.
   */
  @Event() itemDragEnd!: EventEmitter;

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

      const inputEl = this.#inputRef.value as HTMLInputElement | undefined;
      const newCaption = inputEl?.value ?? "";

      if (
        commitEdition &&
        newCaption.trim() !== "" &&
        this.caption !== newCaption
      ) {
        this.captionChange.emit({
          itemId: this.id,
          newCaption: newCaption
        });
      }

      if (shouldFocusHeader && this.#headerRef.value) {
        this.#headerRef.value.focus();
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

  #renderAdditionalItems = (
    additionalItems: ActionListItemAdditionalItem[]
  ): TemplateResult[] =>
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
  ): TemplateResult | typeof nothing => {
    const additionalAction = item as ActionListItemAdditionalAction;
    const hasImage = !!item.imgSrc;
    const hasPseudoImage = hasImage && item.imgType !== "img";
    const pseudoImageStartClass = hasPseudoImage
      ? startPseudoImageTypeDictionary[item.imgType ?? "background"]
      : null;
    const computedPseudoImage = hasPseudoImage
      ? this.#getComputedImage(additionalAction)
      : null;

    const imageTemplate =
      hasImage && item.imgType === "img"
        ? html`<img
            aria-hidden="true"
            class="img"
            part=${item.part
              ? `${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM} ${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE} ${item.part}`
              : `${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM} ${ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE}`}
            alt=""
            src=${item.imgSrc!}
            loading="lazy"
          />`
        : nothing;

    const action = additionalAction.action;

    // Button
    if (action) {
      const actionTypeIsFix = action.type === "fix";
      const actionTypeIsCustom = action.type === "custom";

      return html`<button
        aria-label=${additionalAction.accessibleName}
        class=${tokenMap({
          "additional-item": true,
          [pseudoImageStartClass ?? ""]:
            hasPseudoImage && actionTypeIsCustom && !!pseudoImageStartClass,
          // TODO: Add support for these classes
          [computedPseudoImage?.classes ?? ""]:
            hasPseudoImage && actionTypeIsCustom && !!computedPseudoImage,
          "show-on-mouse-hover":
            (actionTypeIsFix && !this.fixed) ||
            (!actionTypeIsFix && (action as any).showOnHover),
          [action.type]: true,
          fixed: actionTypeIsFix && !!this.fixed,
          "not-fixed": actionTypeIsFix && !this.fixed
        })}
        part=${tokenMap({
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ACTION]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
            this.selectable && this.selected,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
            this.selectable && !this.selected,
          [ACTION_TYPE_PARTS[action.type] satisfies string]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.FIXED]:
            actionTypeIsFix && !!this.fixed,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_FIXED]:
            actionTypeIsFix && !this.fixed,
          [item.part ?? ""]: !!item.part
        })}
        style=${hasPseudoImage && actionTypeIsCustom && computedPseudoImage
          ? styleMap(computedPseudoImage.styles as any)
          : nothing}
        ?disabled=${this.disabled}
        type="button"
        @click=${!this.disabled
          ? this.#handleAdditionalItemClick(
              action.type,
              actionTypeIsCustom
                ? (action as { callback?: (id: string) => void }).callback
                : undefined
            )
          : nothing}
      >
        ${actionTypeIsCustom ? imageTemplate : nothing}
        ${item.caption ? item.caption : nothing}
      </button>`;
    }

    // Span
    if (item.caption) {
      return html`<span
        class=${tokenMap({
          "additional-item not-actionable": true,
          [pseudoImageStartClass ?? ""]: !!pseudoImageStartClass,
          [computedPseudoImage?.classes ?? ""]: !!computedPseudoImage
        })}
        part=${tokenMap({
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_TEXT]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
            this.selectable && this.selected,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
            this.selectable && !this.selected,
          [item.part ?? ""]: !!item.part
        })}
        style=${hasPseudoImage && computedPseudoImage
          ? styleMap(computedPseudoImage.styles as any)
          : nothing}
      >
        ${imageTemplate} ${item.caption}
      </span>`;
    }

    // Div with background or mask
    if (hasPseudoImage) {
      return html`<div
        aria-hidden="true"
        class=${tokenMap({
          "additional-item not-actionable": true,
          [imageTypeDictionary[item.imgType ?? "background"]]: true,
          [computedPseudoImage?.classes ?? ""]: !!computedPseudoImage
        })}
        part=${tokenMap({
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE]: true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
            this.selectable && this.selected,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
            this.selectable && !this.selected,
          [item.part ?? ""]: !!item.part
        })}
        style=${hasPseudoImage && computedPseudoImage
          ? styleMap(computedPseudoImage.styles as any)
          : nothing}
      ></div>`;
    }

    // Img
    if (hasImage) {
      return imageTemplate; // TODO: Add the "additional-item" class
    }

    return nothing;
  };

  #handleAdditionalItemClick =
    (
      type: ActionListItemAdditionalItemActionType["type"],
      callback?: (id: string) => void
    ) =>
    (event: MouseEvent) => {
      event.stopPropagation();

      if (callback) {
        callback(this.id);
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

    this.setAttribute(
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
    additionalModel: ActionListItemAdditionalModel | undefined | false,
    zoneName: ActionListItemAdditionalInformationSection,
    stretch = false
  ): TemplateResult | typeof nothing => {
    if (!additionalModel) {
      return nothing;
    }

    const zoneNameWithPrefix = `item__${zoneName}` as const;

    let actionTypeSection:
      | Exclude<
          ActionListItemAdditionalItemActionType["type"],
          "fix" | "custom"
        >
      | undefined;
    let actionTypeAligns:
      | ActionListItemActionTypeBlockInfo["align"]
      | undefined = undefined;

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
      )!.align;
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
      )!.align;
    }

    return html`<div
      class="align-container ${zoneName}"
      part=${zoneNameWithPrefix}
    >
      ${additionalModel.start
        ? html`<div
            class=${stretch ? "align-start valign-start" : "align-start"}
            part="${zoneNameWithPrefix} start"
          >
            ${actionTypeSection && actionTypeAligns?.includes("start")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.start)}
          </div>`
        : nothing}
      ${additionalModel.center
        ? html`<div
            class=${stretch ? "align-center valign-center" : "align-center"}
            part="${zoneNameWithPrefix} center"
          >
            ${actionTypeSection && actionTypeAligns?.includes("center")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.center)}
          </div>`
        : nothing}
      ${additionalModel.end
        ? html`<div
            class=${stretch ? "align-end valign-end" : "align-end"}
            part="${zoneNameWithPrefix} end"
          >
            ${actionTypeSection && actionTypeAligns?.includes("end")
              ? this.#renderConfirmCancelButtons(actionTypeSection)
              : this.#renderAdditionalItems(additionalModel.end)}
          </div>`
        : nothing}
    </div>`;
  };

  #renderConfirmCancelButtons = (
    action: Exclude<
      ActionListItemAdditionalItemActionType["type"],
      "fix" | "custom"
    >
  ): TemplateResult => html`
    <button
      aria-label=${this.#confirmActionsDictionary[action]()}
      title=${this.#confirmActionsDictionary[action]()}
      class="confirm-action"
      part=${tokenMap({
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM_CONFIRM]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_ACCEPT]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
          this.selectable && this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
          this.selectable && !this.selected
      })}
      ?disabled=${this.disabled}
      type="button"
      @click=${!this.disabled ? this.#acceptAction(action) : nothing}
    ></button>
    <button
      aria-label=${this.#cancelActionsDictionary[action]()}
      title=${this.#cancelActionsDictionary[action]()}
      class="cancel-action"
      part=${tokenMap({
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM_CONFIRM]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION_CANCEL]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
          this.selectable && this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
          this.selectable && !this.selected
      })}
      ?disabled=${this.disabled}
      type="button"
      @click=${!this.disabled ? this.#cancelAction : nothing}
    ></button>
  `;

  #acceptAction =
    (action: ActionListItemAdditionalItemActionType["type"]) =>
    (event: PointerEvent) => {
      event.stopPropagation();

      if (action === "modify") {
        this.#removeEditMode(true, true)();
      } else if (action === "remove") {
        this.remove.emit(this.id);
      }
    };

  #cancelAction = (event: PointerEvent) => {
    event.stopPropagation();

    this.editing = false;
    this.deleting = false;
  };

  #getComputedImage = (
    additionalItem: ActionListItemAdditionalBase
  ): GxImageMultiStateStart | null => {
    if (!additionalItem.imgSrc) {
      return null;
    }

    // Improved efficiency for Lit: use getImagePathCallback directly or
    // fallback to registry
    const getImagePathCallback: ActionListImagePathCallback =
      this.getImagePathCallback ??
      getControlRegisterProperty(
        "getImagePathCallback",
        "ch-action-list-render"
      ) ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    const img = getImagePathCallback(additionalItem);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : null;
  };

  protected override firstWillUpdate(): void {
    // Static attributes
    this.setAttribute("role", "listitem");
    this.setAttribute("part", ACTION_LIST_PARTS_DICTIONARY.ITEM);
    this.#setExportParts();
    this.#setActionTypeBlocks();
  }

  protected override willUpdate(): void {
    // Update aria-selected attribute
    if (this.selectable && this.selected) {
      this.setAttribute("aria-selected", "true");
    } else {
      this.removeAttribute("aria-selected");
    }
  }

  override render() {
    const additionalInfo = this.additionalInfo;
    const hasAdditionalInfo = !!this.additionalInfo;

    const stretchStart = hasAdditionalInfo && additionalInfo!["stretch-start"];
    const blockStart = hasAdditionalInfo && additionalInfo!["block-start"];
    const inlineCaption =
      hasAdditionalInfo && additionalInfo!["inline-caption"];
    const blockEnd = hasAdditionalInfo && additionalInfo!["block-end"];
    const stretchEnd = hasAdditionalInfo && additionalInfo!["stretch-end"];

    const hasParts = !!this.parts;

    return html`<button
      class="action"
      ?disabled=${this.disabled}
      part=${tokenMap({
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED]: this.nested,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED_EXPANDABLE]:
          this.nestedExpandable,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTABLE]: this.selectable,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTABLE]: !this.selectable,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]:
          this.selectable && this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
          this.selectable && !this.selected,
        [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
      })}
      type="button"
      ${ref(this.#headerRef)}
    >
      ${this.#renderAdditionalInfo(stretchStart, "stretch-start", true)}
      ${this.#renderAdditionalInfo(blockStart, "block-start")}

      <div
        class="align-container inline-caption"
        part=${tokenMap({
          "item__inline-caption": true,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.EDITING]: this.editing,
          [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_EDITING]: !this.editing
        })}
      >
        ${this.editing
          ? html`<ch-edit
              autoFocus
              part=${hasParts
                ? `${ACTION_LIST_ITEM_PARTS_DICTIONARY.EDIT_CAPTION} ${this.parts}`
                : ACTION_LIST_ITEM_PARTS_DICTIONARY.EDIT_CAPTION}
              ?disabled=${this.disabled}
              .value=${this.caption}
              @keydown=${!this.disabled
                ? this.#checkIfShouldRemoveEditMode
                : nothing}
              ${ref(this.#inputRef)}
            ></ch-edit>`
          : this.caption
            ? html`<span part=${ACTION_LIST_ITEM_PARTS_DICTIONARY.CAPTION}
                >${this.caption}</span
              >`
            : nothing}
        ${inlineCaption
          ? html`${inlineCaption.start
              ? html`<div class="align-start" part="item__inline-caption start">
                  ${this.#renderAdditionalItems(inlineCaption.start)}
                </div>`
              : nothing}
            ${inlineCaption.end
              ? html`<div class="align-end" part="item__inline-caption end">
                  ${this.#renderAdditionalItems(inlineCaption.end)}
                </div>`
              : nothing}`
          : nothing}
      </div>

      ${this.#renderAdditionalInfo(blockEnd, "block-end")}
      ${this.#renderAdditionalInfo(stretchEnd, "stretch-end")}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-action-list-item": ChActionListItem;
  }
}
