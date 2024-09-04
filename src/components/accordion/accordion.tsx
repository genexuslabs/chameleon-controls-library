import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import {
  AccordionItemModel,
  AccordionItemExpandedChangeEvent,
  AccordionModel,
  AccordionItemModelExpandedSize
} from "./types";
import { tokenMap, updateDirectionInImageCustomVar } from "../../common/utils";
import {
  ACCORDION_PARTS_DICTIONARY,
  DISABLED_CLASS
} from "../../common/reserved-names";
import { GxImageMultiState, GxImageMultiStateStart } from "../../common/types";
import { getControlRegisterProperty } from "../../common/registry-properties";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

const ELEMENTS_TO_PREVENT_EXPAND_COLLAPSE = ["input", "textarea"];

/**
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "accordion.scss",
  tag: "ch-accordion-render"
})
export class ChAccordionRender implements ComponentInterface {
  #images: Map<string, GxImageMultiStateStart | undefined> = new Map();

  /**
   * Useful to track all expand/collapse interactions in order to close all
   * items expect for the last expanded when switching to `singleItemExpanded`
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #expandedItems: Set<string> = new Set();

  /**
   * Useful to rendering items after the first expansion.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #renderedItems: Set<string> = new Set();

  @Element() el: HTMLChAccordionRenderElement;

  /**
   * This attribute lets you specify if all accordions are disabled.
   * If disabled,accordions will not fire any user interaction related event
   * (for example, `expandedChange` event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImages();
  }

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly model?: AccordionModel | undefined;
  @Watch("model")
  modelChanged() {
    this.#computeImages();
    this.#expandedItems.clear();
    this.#renderedItems.clear();

    this.model?.forEach(item => {
      if (item.expanded) {
        this.#expandedItems.add(item.id);
        this.#renderedItems.add(item.id);
      }
    });

    this.#closeAllExpandedItemsExceptForTheLast(false);
  }

  /**
   * If `true` only one item will be expanded at the same time.
   */
  @Prop() readonly singleItemExpanded: boolean = false;
  @Watch("singleItemExpanded")
  singleItemExpandedChanged() {
    this.#closeAllExpandedItemsExceptForTheLast(true);
  }

  /**
   * Fired when an item is expanded or collapsed
   */
  @Event() expandedChange: EventEmitter<AccordionItemExpandedChangeEvent>;

  #computeImage = (
    imageSrc: string | undefined
  ): GxImageMultiStateStart | undefined => {
    if (!imageSrc) {
      return undefined;
    }
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      return undefined;
    }
    const img = getImagePathCallback(imageSrc);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  };

  #computeImages = () => {
    this.#images.clear();

    this.model?.forEach(itemUIModel => {
      const itemImage = this.#computeImage(itemUIModel.startImgSrc);

      if (itemImage) {
        this.#images.set(itemUIModel.id, itemImage);
      }
    });
  };

  #handleHeaderToggle = (event: PointerEvent) => {
    const composedPath = event.composedPath();

    const headerRef = composedPath.find(
      el => (el as HTMLElement).tagName?.toLowerCase() === "button"
    ) as HTMLButtonElement;

    if (
      !headerRef ||
      headerRef.getRootNode() !== this.el.shadowRoot ||
      ELEMENTS_TO_PREVENT_EXPAND_COLLAPSE.includes(
        (composedPath[0] as HTMLElement).tagName?.toLowerCase()
      )
    ) {
      return;
    }

    const itemId = headerRef.id;
    const itemUIModel = this.model.find(item => item.id === itemId);

    if (itemUIModel.disabled) {
      return;
    }

    const newExpandedValue = !itemUIModel.expanded;
    this.#updateExpandedOnItem(itemUIModel, newExpandedValue);
  };

  #updateExpandedOnItem = (
    itemUIModel: AccordionItemModel,
    newExpandedValue: boolean
  ) => {
    // Collapse all opened items and emit expandedChange
    if (this.singleItemExpanded && this.#expandedItems.size > 0) {
      this.model.forEach(itemUIModelToCollapse => {
        if (
          itemUIModelToCollapse.expanded &&
          itemUIModelToCollapse.id !== itemUIModel.id
        ) {
          itemUIModelToCollapse.expanded = false;

          this.expandedChange.emit({
            id: itemUIModelToCollapse.id,
            expanded: false
          });
        }
      });

      this.#expandedItems.clear();
    }

    // If the item is expanded, added it to the Set
    if (newExpandedValue) {
      this.#expandedItems.add(itemUIModel.id);
      this.#renderedItems.add(itemUIModel.id);
    }
    // Otherwise, remove it
    else {
      this.#expandedItems.delete(itemUIModel.id);
    }

    itemUIModel.expanded = newExpandedValue;
    this.expandedChange.emit({
      id: itemUIModel.id,
      expanded: newExpandedValue
    });

    forceUpdate(this);
  };

  #renderItem = (item: AccordionItemModel, index: number) => {
    const startImage = this.#images.get(item.id);
    const startImageClasses = startImage?.classes;
    const isDisabled = item.disabled ?? this.disabled;

    return (
      <div
        class={{ panel: true, "panel--expanded": item.expanded }}
        key={item.id}
        part={tokenMap({
          [item.id]: true,
          [ACCORDION_PARTS_DICTIONARY.PANEL]: true,
          [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
          [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
          [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
        })}
      >
        <button
          id={item.id}
          aria-controls={`section-${index}`}
          aria-label={item.accessibleName || undefined}
          aria-expanded={item.expanded ? "true" : "false"}
          class={{
            header: true,
            [DISABLED_CLASS]: isDisabled,
            "header--expanded": item.expanded,
            [`start-img-type--${
              item.startImgType ?? "background"
            } pseudo-img--start`]: !!startImage,
            [startImageClasses]: !!startImageClasses
          }}
          part={tokenMap({
            [item.id]: true,
            [item.headerSlotId]: !!item.headerSlotId,
            [ACCORDION_PARTS_DICTIONARY.HEADER]: true,
            [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
            [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
            [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
          })}
          style={startImage?.styles ?? undefined}
          disabled={isDisabled}
          type="button"
        >
          {item.headerSlotId ? <slot name={item.headerSlotId} /> : item.caption}
        </button>

        <section
          id={`section-${index}`}
          aria-label={item.accessibleName || undefined}
          aria-labelledby={!item.accessibleName ? item.id : undefined}
          class={!item.expanded ? "section--hidden" : undefined}
        >
          {(this.#renderedItems.has(item.id) || !item.id) && (
            <div
              class="sub-section"
              part={tokenMap({
                [item.id]: true,
                [ACCORDION_PARTS_DICTIONARY.SECTION]: true,
                [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
                [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
                [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
              })}
            >
              <slot name={item.id} />
            </div>
          )}
        </section>
      </div>
    );
  };

  #closeAllExpandedItemsExceptForTheLast = (
    emitExpandedChangeEvent: boolean
  ) => {
    if (!this.singleItemExpanded || this.#expandedItems.size <= 1) {
      return;
    }

    const lastItemId = [...this.#expandedItems.keys()].at(-1);

    // Close all items except for the last and emit the expandedChange event
    this.model.forEach(itemUIModel => {
      if (itemUIModel.expanded && itemUIModel.id !== lastItemId) {
        itemUIModel.expanded = false;

        if (emitExpandedChangeEvent) {
          this.expandedChange.emit({ id: itemUIModel.id, expanded: false });
        }
      }
    });

    this.#expandedItems.clear();
    this.#expandedItems.add(lastItemId);
  };

  #computeGridTemplateRows = () =>
    this.model
      .map(item =>
        item.expanded
          ? item.expandedSize ?? "max-content"
          : this.#getCollapsedSizeForUnit(item.expandedSize)
      )
      .join(" ");

  #getCollapsedSizeForUnit = (expandedSize: AccordionItemModelExpandedSize) =>
    expandedSize && expandedSize.includes("fr") ? "0fr" : "max-content";

  connectedCallback(): void {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty(
        "getImagePathCallback",
        "ch-accordion-render"
      ) ?? DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImages();

    this.model?.forEach(item => {
      if (item.expanded) {
        this.#expandedItems.add(item.id);
        this.#renderedItems.add(item.id);
      }
    });

    this.#closeAllExpandedItemsExceptForTheLast(false);
  }

  render() {
    return (
      <Host
        // TODO: Add support to prevent expand/collapse when pressing the space
        // key on an input/textarea
        style={
          this.model != null
            ? {
                "--ch-accordion-grid-template-rows":
                  this.#computeGridTemplateRows()
              }
            : undefined
        }
        onClick={this.#handleHeaderToggle}
      >
        {(this.model ?? []).map(this.#renderItem)}
      </Host>
    );
  }
}
