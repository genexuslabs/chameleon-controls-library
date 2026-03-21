import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { COMBO_BOX_PARTS_DICTIONARY } from "../../utilities/reserved-names/reserved-names";
import { tokenMap } from "../../utilities/mapping/token-map";
import { getCaptionFromItem } from "./get-caption-from-item";
import type {
  ComboBoxItemGroup,
  ComboBoxItemImagesModel,
  ComboBoxItemModel,
  ComboBoxModel
} from "./types";

const INDEX_SEPARATOR = "__";

const getComboBoxElementIndex = (
  parentIndex: string,
  index: number,
  insideAGroup: boolean
) => (insideAGroup ? `${parentIndex}${INDEX_SEPARATOR}${index}` : `${index}`);

export const getComboBoxItemUIModel = (
  index: string,
  model: ComboBoxModel
): ComboBoxItemModel => {
  const indexes = index.split(INDEX_SEPARATOR);
  const itemFirstLevel = model[Number(indexes[0])];

  if (
    indexes.length === 2 &&
    (itemFirstLevel as ComboBoxItemGroup).items != null
  ) {
    return (itemFirstLevel as ComboBoxItemGroup).items[Number(indexes[1])];
  }
  return itemFirstLevel;
};

// TODO: Add a unit test for these cases
export const getComboBoxItemImageStyle = (
  images: ComboBoxItemImagesModel | undefined
) => {
  if (!images) {
    return undefined;
  }

  if (images.start && images.end) {
    return {
      ...images.start.styles,
      ...images.end.styles
    };
  }

  return images.start?.styles ?? images.end.styles;
};

export const customComboBoxItemRender =
  (
    insideAGroup: boolean,
    parentDisabled: boolean,
    checkToDisplayValue: boolean,
    activeDescendantValue: ComboBoxItemModel | undefined,
    displayedValues: Set<ComboBoxItemModel> | undefined,
    itemImages: Map<string, ComboBoxItemImagesModel>,
    parentIndex: string
  ) =>
  (
    item: ComboBoxItemModel,
    index: number
  ): TemplateResult | typeof nothing => {
    if (
      checkToDisplayValue &&
      // !this.#isModelAlreadyFiltered() &&
      !displayedValues.has(item)
    ) {
      return nothing;
    }

    const images: ComboBoxItemImagesModel | undefined =
      !!item.startImgSrc || !!item.endImgSrc
        ? itemImages.get(item.value)
        : undefined;
    const hasStartImg = !!images?.start;
    const hasEndImg = !!images?.end;

    const startImgClasses = hasStartImg
      ? `img--start start-img-type--${item.startImgType ?? "background"} ${
          images.start.classes
        }`
      : undefined;
    const endImgClasses = hasEndImg
      ? `img--end end-img-type--${item.endImgType ?? "background"} ${
          images.end.classes
        }`
      : undefined;

    // This variable inherits the disabled state from group parents. Useful
    // to propagate the disabled state in the child buttons
    const isDisabled = parentDisabled || item.disabled;
    const itemGroup = item as ComboBoxItemGroup;
    const isActiveDescendant = item.value === activeDescendantValue?.value;

    const itemIndex = getComboBoxElementIndex(
      parentIndex,
      index,
      insideAGroup
    );

    return itemGroup.items != null
      ? html`<div
          role="group"
          class="group"
          aria-controls=${itemGroup.expandable
            ? `${index}__content`
            : nothing}
          aria-expanded=${itemGroup.expandable
            ? (!!itemGroup.expanded).toString()
            : nothing}
          aria-labelledby=${index.toString()}
          part=${tokenMap({
            [item.value]: true,
            [COMBO_BOX_PARTS_DICTIONARY.GROUP]: true,
            [COMBO_BOX_PARTS_DICTIONARY.DISABLED]: isDisabled
          })}
        >
          ${itemGroup.expandable
            ? html`<button
                id=${itemIndex}
                class=${classMap({
                  group__header: true,
                  "group--expandable": true,
                  "group--collapsed": !itemGroup.expanded,
                  disabled: isDisabled
                })}
                part=${tokenMap({
                  [item.value]: true,
                  [COMBO_BOX_PARTS_DICTIONARY.GROUP_HEADER]: true,
                  [COMBO_BOX_PARTS_DICTIONARY.EXPANDABLE]: true,
                  [COMBO_BOX_PARTS_DICTIONARY.DISABLED]: isDisabled,
                  [COMBO_BOX_PARTS_DICTIONARY.EXPANDED]: itemGroup.expanded,
                  [COMBO_BOX_PARTS_DICTIONARY.COLLAPSED]: !itemGroup.expanded
                })}
                style=${images ? styleMap(getComboBoxItemImageStyle(images) as any) : nothing}
                ?disabled=${isDisabled}
                type="button"
              >
                <span
                  class=${classMap({
                    "group__header-caption": true,
                    [startImgClasses]: hasStartImg,
                    [endImgClasses]: hasEndImg
                  })}
                  part=${`${COMBO_BOX_PARTS_DICTIONARY.GROUP_HEADER_CAPTION} ${item.value}`}
                >
                  ${getCaptionFromItem(item)}
                </span>
              </button>`
            : html`<span
                id=${index.toString()}
                class=${classMap({
                  group__header: true,
                  disabled: isDisabled,
                  [startImgClasses]: hasStartImg,
                  [endImgClasses]: hasEndImg
                })}
                part=${tokenMap({
                  [item.value]: true,
                  [COMBO_BOX_PARTS_DICTIONARY.GROUP_HEADER]: true,
                  [COMBO_BOX_PARTS_DICTIONARY.DISABLED]: isDisabled
                })}
                style=${images ? styleMap(getComboBoxItemImageStyle(images) as any) : nothing}
              >
                ${getCaptionFromItem(item)}
              </span>`}

          <div
            id=${itemGroup.expandable ? `${index}__content` : nothing}
            class=${classMap({
              group__content: true,
              "group__content--collapsed":
                itemGroup.expandable && !itemGroup.expanded
            })}
            part=${`${COMBO_BOX_PARTS_DICTIONARY.GROUP_CONTENT} ${item.value}`}
          >
            ${(!itemGroup.expandable || itemGroup.expanded)
              ? itemGroup.items.map(
                  customComboBoxItemRender(
                    true,
                    isDisabled,
                    checkToDisplayValue,
                    activeDescendantValue,
                    displayedValues,
                    itemImages,
                    itemIndex
                  )
                )
              : nothing}
          </div>
        </div>`
      : html`<button
          id=${itemIndex}
          role="option"
          aria-selected=${isActiveDescendant ? "true" : "false"}
          tabindex="-1"
          class=${classMap({
            leaf: true,
            disabled: isDisabled,
            selected: isActiveDescendant,
            [startImgClasses]: hasStartImg,
            [endImgClasses]: hasEndImg
          })}
          part=${tokenMap({
            [item.value]: true,
            [COMBO_BOX_PARTS_DICTIONARY.ITEM]: true,
            [COMBO_BOX_PARTS_DICTIONARY.NESTED]: insideAGroup,
            [COMBO_BOX_PARTS_DICTIONARY.DISABLED]: isDisabled,
            [COMBO_BOX_PARTS_DICTIONARY.SELECTED]: isActiveDescendant
          })}
          style=${images ? styleMap(getComboBoxItemImageStyle(images) as any) : nothing}
          ?disabled=${isDisabled}
          type="button"
        >
          ${
            // TODO: Add unit test for this case
            item.caption ?? item.value
          }
        </button>`;
  };

export const nativeItemRender = (
  item: ComboBoxItemModel,
  selectedValue: string
): TemplateResult =>
  (item as ComboBoxItemGroup).items != null
    ? html`<optgroup label=${item.caption ?? item.value}>
        ${(item as ComboBoxItemGroup).items.map(item =>
          nativeItemRender(item, selectedValue)
        )}
      </optgroup>`
    : html`<option
        value=${item.value}
        ?disabled=${item.disabled}
        ?selected=${item.value === selectedValue}
      >
        ${item.caption ?? item.value}
      </option>`;
