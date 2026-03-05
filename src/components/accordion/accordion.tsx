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
import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  ACCORDION_PARTS_DICTIONARY,
  DISABLED_CLASS
} from "../../common/reserved-names";
import { GxImageMultiState, GxImageMultiStateStart } from "../../common/types";
import { tokenMap, updateDirectionInImageCustomVar } from "../../common/utils";
import {
  AccordionItemExpandedChangeEvent,
  AccordionItemModel,
  AccordionItemModelExpandedSize,
  AccordionModel
} from "./types";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

const ELEMENTS_TO_PREVENT_EXPAND_COLLAPSE = ["input", "textarea"];

/**
 * The `ch-accordion-render` component displays a vertical stack of collapsible panels, each with a clickable header that toggles the visibility of its associated content section.
 *
 * @remarks
 * ## Features
 *  - Expand or collapse panels on demand to organize lengthy content into space-efficient sections.
 *  - Single-item mode (`singleItemExpanded`) ensures only one panel is open at a time, automatically closing the others.
 *  - Configurable expandable button position (`start` or `end`) in each panel header.
 *  - Per-item images in the header via `startImgSrc` and a customizable image-path callback.
 *  - Disabled state at the control level or per individual item.
 *  - Custom header content through named slots.
 *
 * ## Use when
 *  - Organizing lengthy content into logically grouped, collapsible sections (FAQs, settings pages, form groups).
 *  - Reducing cognitive load by showing one section at a time.
 *  - Reducing page length when users are unlikely to need all sections simultaneously (FAQs, settings).
 *  - Space-constrained UIs where vertical scrolling is undesirable and content can be consumed independently.
 *
 * ## Do not use when
 *  - Users need to compare content side-by-side -- the accordion pattern inherently hides inactive sections.
 *  - Users are likely to read all sections — use plain headings and scrollable content instead.
 *  - Content sections are interdependent and must be compared side by side — the back-and-forth is too costly.
 *  - Sequential step-by-step processes where hiding steps creates confusion — prefer a stepper/wizard.
 *  - Nesting accordions within accordions — double-nested collapsed panels disorient users.
 *
 * ## Accessibility
 *  - Each header is a `<button>` with `aria-expanded` and `aria-controls` linking to its section.
 *  - Sections are labelled via `aria-labelledby` pointing back to the header button, or via explicit `aria-label` when provided.
 *  - Supports the disclosure pattern: toggling a header expands or collapses its associated section.
 *
 * @status experimental
 *
 * @part header - The clickable `<button>` element that toggles the collapsible section. Present on every item.
 * @part panel - The outer container that wraps the `header` and the `section` of each item.
 * @part section - The collapsible `<section>` element that contains the item's body content.
 *
 * @part disabled - Present in the `header`, `panel`, and `section` parts when the item is disabled.
 * @part expanded - Present in the `header`, `panel`, and `section` parts when the item is expanded.
 * @part collapsed - Present in the `header`, `panel`, and `section` parts when the item is collapsed.
 *
 * @slot {item.headerSlotId} - Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`.
 * @slot {item.id} - Named slot projected inside the `section` for each item's collapsible body content.
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
   * Specifies the position of the expandable button (chevron) in the header
   * of the panels. `"start"` places the chevron at the inline-start edge of
   * the header, while `"end"` places it at the inline-end edge.
   */
  @Prop() readonly expandableButtonPosition: "start" | "end" = "end";

  /**
   * This property specifies a callback that is executed when the path for an
   * `startImgSrc` needs to be resolved. The resolution follows a fallback
   * chain: per-instance callback → global registry callback → built-in
   * default (which wraps the src in `{ base: imageSrc }`).
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImages();
  }

  /**
   * Specifies the items of the control. Each entry is an
   * `AccordionItemModel` with at least `id`, `caption`, and `expanded`.
   * The component mutates `item.expanded` directly on these model objects
   * when the user toggles a panel.
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
   * Fired when an item is expanded or collapsed. The payload is
   * `{ id: string; expanded: boolean }`. In `singleItemExpanded` mode,
   * multiple events fire: one for each auto-collapsed item (with
   * `expanded: false`) followed by one for the newly expanded item.
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
            [`header--expand-button-${this.expandableButtonPosition}`]: true,
            [`header--expand-button-${this.expandableButtonPosition}-collapsed`]:
              !item.expanded,
            [`header--expand-button-${this.expandableButtonPosition}-expanded`]:
              item.expanded,
            [DISABLED_CLASS]: isDisabled,
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
