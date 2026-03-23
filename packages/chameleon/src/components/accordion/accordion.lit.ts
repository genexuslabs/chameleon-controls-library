import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { IS_SERVER } from "../../development-flags";
import type { GetImagePathCallback, ImageRender } from "../../typings/multi-state-images";
import { Host } from "../../utilities/host/host";
import { tokenMap } from "../../utilities/mapping/token-map";
import { createResolvedImagePathCallback } from "../../utilities/register-properties/image-path-registry";
import { DISABLED_CLASS } from "../../utilities/reserved-names/common";
import { ACCORDION_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/accordion";
import type {
  AccordionItemExpandedChangeEvent,
  AccordionItemModel,
  AccordionItemModelExpandedSize,
  AccordionModel
} from "./types";

import styles from "./accordion.scss?inline";

// In the server we need to preload the ch-image just in case to properly
// render it, because Lit doesn't support async rendering in the server.
// In the client we can lazy load the ch-image, since not all accordion items
// will use an icon
if (IS_SERVER) {
  await import("../image/image.lit");
}

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
 * @csspart header - The clickable `<button>` element that toggles the collapsible section. Present on every item.
 * @csspart panel - The outer container that wraps the `header` and the `section` of each item.
 * @csspart section - The collapsible `<section>` element that contains the item's body content.
 *
 * @csspart disabled - Present in the `header`, `panel`, and `section` parts when the item is disabled.
 * @csspart expanded - Present in the `header`, `panel`, and `section` parts when the item is expanded.
 * @csspart collapsed - Present in the `header`, `panel`, and `section` parts when the item is collapsed.
 *
 * @slot {item.headerSlotId} - Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`.
 * @slot {item.id} - Named slot projected inside the `section` for each item's collapsible body content.
 *
 * @cssprop [--ch-accordion__chevron-size = #{$default-decorative-image-size}] - Specifies the box size of the chevron.
 * @cssprop [--ch-accordion__chevron-image-size = 100%] - Specifies the image size of the chevron.
 * @cssprop [--ch-accordion__chevron-color = currentColor] - Specifies the color of the chevron.
 * @cssprop [--ch-accordion-expand-collapse-duration = 0ms] - Specifies duration of the expand and collapse animation.
 * @cssprop [--ch-accordion-expand-collapse-timing-function = linear] - Specifies timing function of the expand and collapse animation.
 * @cssprop [--ch-accordion__header-background-image = #{$expandable-icon}] - Specifies the background image used for the expandable chevron in the header.
 */
@Component({
  styles,
  tag: "ch-accordion-render"
})
export class ChAccordionRender extends KasstorElement {
  /**
   * Useful to track all expand/collapse interactions in order to close all
   * items expect for the last expanded when switching to `singleItemExpanded`
   */
  #expandedItems: Set<string> = new Set();

  /**
   * Useful to rendering items after the first expansion.
   */
  #renderedItems: Set<string> = new Set();

  /**
   * Computed signal that resolves the image path callback with the
   * following priority: local property > global registry signal.
   * Using `watch()` in the template causes pin-point updates to only the
   * `<ch-image>` bindings when the registry changes.
   */
  #resolvedImagePathCallback = createResolvedImagePathCallback(() => this.getImagePathCallback);

  /**
   * This attribute lets you specify if all accordions are disabled.
   * If disabled, accordions will not fire any user interaction related event
   * (for example, `expandedChange` event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * Specifies the position of the expandable button (chevron) in the header
   * of the panels. `"start"` places the chevron at the inline-start edge of
   * the header, while `"end"` places it at the inline-end edge.
   */
  @property({ attribute: "expandable-button-position" })
  expandableButtonPosition: "start" | "end" = "end";

  /**
   * This property specifies a callback that is executed when the path for an
   * `startImgSrc` needs to be resolved. The resolution follows a fallback
   * chain: per-instance callback → global registry signal → `undefined`.
   */
  @property({ attribute: false }) getImagePathCallback: GetImagePathCallback | undefined;

  /**
   * Specifies the items of the control. Each entry is an
   * `AccordionItemModel` with at least `id`, `caption`, and `expanded`.
   * The component mutates `item.expanded` directly on these model objects
   * when the user toggles a panel.
   */
  @property({ attribute: false }) model: AccordionModel | undefined;
  @Observe("model")
  protected modelChanged() {
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
  @property({ type: Boolean, attribute: "single-item-expanded" })
  singleItemExpanded: boolean = false;
  @Observe("singleItemExpanded")
  protected singleItemExpandedChanged() {
    this.#closeAllExpandedItemsExceptForTheLast(true);
  }

  /**
   * Fired when an item is expanded or collapsed. The payload is
   * `{ id: string; expanded: boolean }`. In `singleItemExpanded` mode,
   * multiple events fire: one for each auto-collapsed item (with
   * `expanded: false`) followed by one for the newly expanded item.
   */
  @Event() expandedChange!: EventEmitter<AccordionItemExpandedChangeEvent>;

  #handleHeaderToggle = (event: PointerEvent) => {
    const composedPath = event.composedPath();

    const headerRef = composedPath.find(
      el => (el as HTMLElement).tagName?.toLowerCase() === "button"
    ) as HTMLButtonElement;

    if (
      !headerRef ||
      headerRef.getRootNode() !== this.shadowRoot ||
      ELEMENTS_TO_PREVENT_EXPAND_COLLAPSE.includes(
        (composedPath[0] as HTMLElement).tagName?.toLowerCase()
      )
    ) {
      return;
    }

    const itemId = headerRef.id;
    const itemUIModel = this.model!.find(item => item.id === itemId);

    if (!itemUIModel || itemUIModel.disabled) {
      return;
    }

    const newExpandedValue = !itemUIModel.expanded;
    this.#updateExpandedOnItem(itemUIModel, newExpandedValue);
  };

  #updateExpandedOnItem = (itemUIModel: AccordionItemModel, newExpandedValue: boolean) => {
    // Collapse all opened items and emit expandedChange
    if (this.singleItemExpanded && this.#expandedItems.size > 0) {
      this.model!.forEach(itemUIModelToCollapse => {
        if (itemUIModelToCollapse.expanded && itemUIModelToCollapse.id !== itemUIModel.id) {
          itemUIModelToCollapse.expanded = false;

          this.expandedChange.emit({
            id: itemUIModelToCollapse.id,
            expanded: false
          });
        }
      });

      this.#expandedItems.clear();
    }

    // If the item is expanded, add it to the Set
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

    this.requestUpdate();
  };

  #renderItem = (item: AccordionItemModel, index: number) => {
    const isDisabled = item.disabled ?? this.disabled;
    const hasStartImage = !!item.startImgSrc;

    return html`<div
      class=${item.expanded ? "panel panel--expanded" : "panel"}
      part=${tokenMap({
        [item.id]: true,
        [ACCORDION_PARTS_DICTIONARY.PANEL]: true,
        [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
        [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
        [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
      })}
    >
      <button
        id=${item.id}
        aria-controls=${`section-${index}`}
        aria-label=${item.accessibleName || nothing}
        aria-expanded=${item.expanded ? "true" : "false"}
        class=${tokenMap({
          header: true,
          [`header--expand-button-${this.expandableButtonPosition}`]: true,
          [`header--expand-button-${this.expandableButtonPosition}-collapsed`]: !item.expanded,
          [`header--expand-button-${this.expandableButtonPosition}-expanded`]: item.expanded,
          [DISABLED_CLASS]: isDisabled
        })}
        part=${tokenMap({
          [item.id]: true,
          [item.headerSlotId!]: !!item.headerSlotId,
          [ACCORDION_PARTS_DICTIONARY.HEADER]: true,
          [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
          [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
          [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
        })}
        ?disabled=${isDisabled}
        type="button"
      >
        ${hasStartImage
          ? html`<ch-image
              .disabled=${isDisabled}
              .getImagePathCallback=${this.#resolvedImagePathCallback()}
              .src=${item.startImgSrc}
              .type=${item.startImgType as Exclude<ImageRender, "img">}
            ></ch-image>`
          : nothing}
        ${item.headerSlotId ? html`<slot name=${item.headerSlotId}></slot>` : item.caption}
      </button>

      <section
        id=${`section-${index}`}
        aria-label=${item.accessibleName || nothing}
        aria-labelledby=${!item.accessibleName ? item.id : nothing}
        class=${!item.expanded ? "section--hidden" : nothing}
      >
        ${this.#renderedItems.has(item.id) || !item.id
          ? html`<div
              class="sub-section"
              part=${tokenMap({
                [item.id]: true,
                [ACCORDION_PARTS_DICTIONARY.SECTION]: true,
                [ACCORDION_PARTS_DICTIONARY.DISABLED]: isDisabled,
                [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
                [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
              })}
            >
              <slot name=${item.id}></slot>
            </div>`
          : nothing}
      </section>
    </div>`;
  };

  #closeAllExpandedItemsExceptForTheLast = (emitExpandedChangeEvent: boolean) => {
    if (!this.singleItemExpanded || this.#expandedItems.size <= 1) {
      return;
    }

    const lastItemId = [...this.#expandedItems.keys()].at(-1)!;

    // Close all items except for the last and emit the expandedChange event
    this.model!.forEach(itemUIModel => {
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
    this.model!.map(item =>
      item.expanded
        ? (item.expandedSize ?? "max-content")
        : this.#getCollapsedSizeForUnit(item.expandedSize)
    ).join(" ");

  #getCollapsedSizeForUnit = (expandedSize: AccordionItemModelExpandedSize) =>
    expandedSize && expandedSize.includes("fr") ? "0fr" : "max-content";

  override render() {
    // TODO: Add support to prevent expand/collapse when pressing the space
    // key on an input/textarea
    Host(this, {
      style:
        this.model != null
          ? {
              "--ch-accordion-grid-template-rows": this.#computeGridTemplateRows()
            }
          : undefined,
      events: { click: this.#handleHeaderToggle }
    });

    return this.model == null ? nothing : html`${this.model.map(this.#renderItem)}`;
  }
}


// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChAccordionRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChAccordionRenderElement;
  }

  /** Type of the `ch-accordion-render`'s `expandedChange` event. */
  // prettier-ignore
  type HTMLChAccordionRenderElementExpandedChangeEvent = HTMLChAccordionRenderElementCustomEvent<
    HTMLChAccordionRenderElementEventMap["expandedChange"]
  >;

  interface HTMLChAccordionRenderElementEventMap {
    expandedChange: AccordionItemExpandedChangeEvent;
  }

  interface HTMLChAccordionRenderElementEventTypes {
    expandedChange: HTMLChAccordionRenderElementExpandedChangeEvent;
  }

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
   * @csspart header - The clickable `<button>` element that toggles the collapsible section. Present on every item.
   * @csspart panel - The outer container that wraps the `header` and the `section` of each item.
   * @csspart section - The collapsible `<section>` element that contains the item's body content.
   *
   * @csspart disabled - Present in the `header`, `panel`, and `section` parts when the item is disabled.
   * @csspart expanded - Present in the `header`, `panel`, and `section` parts when the item is expanded.
   * @csspart collapsed - Present in the `header`, `panel`, and `section` parts when the item is collapsed.
   *
   * @slot {item.headerSlotId} - Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`.
   * @slot {item.id} - Named slot projected inside the `section` for each item's collapsible body content.
   *
   * @cssprop [--ch-accordion__chevron-size = #{$default-decorative-image-size}] - Specifies the box size of the chevron.
   * @cssprop [--ch-accordion__chevron-image-size = 100%] - Specifies the image size of the chevron.
   * @cssprop [--ch-accordion__chevron-color = currentColor] - Specifies the color of the chevron.
   * @cssprop [--ch-accordion-expand-collapse-duration = 0ms] - Specifies duration of the expand and collapse animation.
   * @cssprop [--ch-accordion-expand-collapse-timing-function = linear] - Specifies timing function of the expand and collapse animation.
   * @cssprop [--ch-accordion__header-background-image = #{$expandable-icon}] - Specifies the background image used for the expandable chevron in the header.
   *
   * @fires expandedChange Fired when an item is expanded or collapsed. The payload is
   *   `{ id: string; expanded: boolean }`. In `singleItemExpanded` mode,
   *   multiple events fire: one for each auto-collapsed item (with
   *   `expanded: false`) followed by one for the newly expanded item.
   */
  // prettier-ignore
  interface HTMLChAccordionRenderElement extends ChAccordionRender {
    // Extend the ChAccordionRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChAccordionRenderElementEventTypes>(type: K, listener: (this: HTMLChAccordionRenderElement, ev: HTMLChAccordionRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChAccordionRenderElementEventTypes>(type: K, listener: (this: HTMLChAccordionRenderElement, ev: HTMLChAccordionRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-accordion-render": HTMLChAccordionRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-accordion-render": HTMLChAccordionRenderElement;
  }
}

