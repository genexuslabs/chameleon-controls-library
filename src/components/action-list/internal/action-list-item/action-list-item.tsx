import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  h
} from "@stencil/core";
import {
  ActionListItemAdditionalAction,
  ActionListItemAdditionalBase,
  ActionListItemAdditionalCustom,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalItemActionType
} from "../../types";
import { renderImg } from "../../../../common/renders";
import {
  ACTION_LIST_ITEM_EXPORT_PARTS,
  ACTION_LIST_ITEM_PARTS_DICTIONARY,
  imageTypeDictionary,
  startPseudoImageTypeDictionary
} from "../../../../common/reserved-names";
import { ActionListFixedChangeEventDetail } from "./types";
import { tokenMap } from "../../../../common/utils";

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
    fix: () => {
      this.fixedChange.emit({ itemId: this.el.id, value: !this.fixed });
    },
    remove: () => {
      this.remove.emit(this.el.id);
    },
    custom: callback => callback()
  };

  @Element() el: HTMLChActionListItemElement;

  /**
   *
   */
  @Prop() readonly additionalInfo?: ActionListItemAdditionalInformation;

  /**
   * This attributes specifies the caption of the control
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
   * This attribute lets you specify if the edit operation is enabled in the
   * control. If `true`, the control can edit its caption in place.
   */
  @Prop() readonly editable: boolean;

  /**
   * Set this attribute when the item is in edit mode
   */
  @Prop({ mutable: true }) editing = false;
  // @Watch("editing")
  // editingChanged(isEditing: boolean) {
  //   if (!isEditing) {
  //     return;
  //   }

  //   document.addEventListener("click", this.#removeEditModeOnClick, {
  //     capture: true
  //   });

  //   // Wait until the input is rendered to focus it
  //   writeTask(() => {
  //     requestAnimationFrame(() => {
  //       if (this.#inputRef) {
  //         this.#inputRef.focus();
  //       }
  //     });
  //   });
  // }

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
   * This attribute lets you specify if the item is selected
   */
  @Prop({ mutable: true, reflect: true }) selected = false;

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @Prop() readonly showDownloadingSpinner: boolean = true;

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
  fixedChange: EventEmitter<ActionListFixedChangeEventDetail>;

  /**
   * Fired when the remove button was clicked in the control.
   */
  @Event({ composed: true }) remove: EventEmitter<string>;

  /**
   * Fired when the item is no longer being dragged.
   */
  @Event() itemDragEnd: EventEmitter;

  // /**
  //  * Fired when the item is asking to modify its caption.
  //  */
  // @Event() modifyCaption: EventEmitter<TreeViewItemNewCaption>;

  // /**
  //  * Fired when the selected state is updated by user interaction on the
  //  * control.
  //  */
  // @Event() selectedItemChange: EventEmitter<TreeViewItemSelected>;

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
          disabled={this.disabled}
          class={{
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
          type="button"
          onClick={this.#handleAdditionalItemClick(
            action.type,
            actionTypeIsCustom ? action.callback : undefined
          )}
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
          class={pseudoImageStartClass ?? null}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_TEXT]: true,
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
          class={imageTypeDictionary[item.imageType ?? "background"]}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_ITEM]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ADDITIONAL_IMAGE]: true,
            [item.part]: !!item.part
          })}
          style={{ "--ch-img": `url(${item.imageSrc})` }}
        ></div>
      );
    }

    // Img
    if (hasImage && item.imageType === "background") {
      return imageTag;
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
        this.#additionalItemListenerDictionary[type]();
      }
    };

  connectedCallback() {
    this.el.setAttribute("role", "listitem");
    this.el.setAttribute("exportparts", ACTION_LIST_ITEM_EXPORT_PARTS);
  }

  render() {
    const additionalInfo = this.additionalInfo;
    const hasAdditionalInfo = !!this.additionalInfo;

    const stretchStart = hasAdditionalInfo && additionalInfo["stretch-start"];
    const blockStart = hasAdditionalInfo && additionalInfo["block-start"];
    const inlineCaption = hasAdditionalInfo && additionalInfo["inline-caption"];
    const blockEnd = hasAdditionalInfo && additionalInfo["block-end"];
    const stretchEnd = hasAdditionalInfo && additionalInfo["stretch-end"];

    return (
      <Host aria-selected={this.selected ? "true" : null}>
        <button
          class="action"
          disabled={this.disabled}
          part={tokenMap({
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED]: this.nested,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NESTED_EXPANDABLE]:
              this.nestedExpandable,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected,
            [ACTION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
          type="button"
        >
          {stretchStart && (
            <div
              key="item__stretch-start"
              class="align-container stretch-start"
              part="item__stretch-start"
            >
              {stretchStart.start && (
                <div
                  key="item__stretch-start-start"
                  class="align-start valign-start"
                  part="item__stretch-start start"
                >
                  {this.#renderAdditionalItems(stretchStart.start)}
                </div>
              )}
              {stretchStart.center && (
                <div
                  key="item__stretch-start-center"
                  class="align-center valign-center"
                  part="item__stretch-start center"
                >
                  {this.#renderAdditionalItems(stretchStart.center)}
                </div>
              )}
              {stretchStart.end && (
                <div
                  key="item__stretch-start-end"
                  class="align-end valign-end"
                  part="item__stretch-start end"
                >
                  {this.#renderAdditionalItems(stretchStart.end)}
                </div>
              )}
            </div>
          )}

          {blockStart && (
            <div
              key="item__block-start"
              class="align-container block-start"
              part="item__block-start"
            >
              {blockStart.start && (
                <div
                  key="item__block-start-start"
                  class="align-start"
                  part="item__block-start start"
                >
                  {this.#renderAdditionalItems(blockStart.start)}
                </div>
              )}
              {blockStart.end && (
                <div
                  key="item__block-start-end"
                  class="align-end"
                  part="item__block-start end"
                >
                  {this.#renderAdditionalItems(blockStart.end)}
                </div>
              )}
            </div>
          )}

          <div
            key="item__inline-caption"
            class="align-container inline-caption"
            part="item__inline-caption"
          >
            {this.caption && (
              <span part={ACTION_LIST_ITEM_PARTS_DICTIONARY.CAPTION}>
                {this.caption}
              </span>
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

          {blockEnd && (
            <div
              key="item__block-end"
              class="align-container block-end"
              part="item__block-end"
            >
              {blockEnd.start && (
                <div
                  key="item__block-end-start"
                  class="align-start"
                  part="item__block-end start"
                >
                  {this.#renderAdditionalItems(blockEnd.start)}
                </div>
              )}
              {blockEnd.end && (
                <div
                  key="item__block-end-end"
                  class="align-end"
                  part="item__block-end end"
                >
                  {this.#renderAdditionalItems(blockEnd.end)}
                </div>
              )}
            </div>
          )}

          {stretchEnd && (
            <div
              key="item__stretch-end"
              class="align-container stretch-end"
              part="item__stretch-end"
            >
              {stretchEnd.start && (
                <div
                  key="item__stretch-end-start"
                  class="align-start valign-start"
                  part="item__stretch-end start"
                >
                  {this.#renderAdditionalItems(stretchEnd.start)}
                </div>
              )}
              {stretchEnd.center && (
                <div
                  key="item__stretch-end-center"
                  class="align-center valign-center"
                  part="item__stretch-end center"
                >
                  {this.#renderAdditionalItems(stretchEnd.center)}
                </div>
              )}
              {stretchEnd.end && (
                <div
                  key="item__stretch-end-end"
                  class="align-end valign-end"
                  part="item__stretch-end end"
                >
                  {this.#renderAdditionalItems(stretchEnd.end)}
                </div>
              )}
            </div>
          )}
        </button>
      </Host>
    );
  }
}
