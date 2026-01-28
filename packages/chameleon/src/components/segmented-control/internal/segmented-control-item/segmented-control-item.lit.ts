import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import type { ImageRender } from "../../../../typings/multi-state-images";
import { SEGMENTED_CONTROL_PARTS_DICTIONARY } from "../../../../utilities/reserved-names/parts/segmented-control";

import styles from "./segmented-control-item.scss?inline";

// Optimize render performance: Internal components don't need sync properties
// with attributes.
const NO_ATTRIBUTE = { attribute: false };
const BOOLEAN_TYPE_PROP = { attribute: false, type: Boolean };

/**
 * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
 * This control represents and item of the ch-segmented-control-render
 *
 * @part selected - ...
 */
@Component({
  styles,
  tag: "ch-segmented-control-item"
})
export class ChSegmentedControlItem extends KasstorElement {
  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property(NO_ATTRIBUTE) accessibleName: string | undefined;

  /**
   * `true` if the control is the not the first or last item in the
   * ch-segmented-control-render.
   */
  @property(BOOLEAN_TYPE_PROP) between: boolean = false;

  /**
   * Specifies the caption that the control will display.
   */
  @property(NO_ATTRIBUTE) caption: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property(BOOLEAN_TYPE_PROP) disabled: boolean | undefined;

  /**
   * Specifies the src of the end image.
   */
  @property(NO_ATTRIBUTE) endImgSrc: string | undefined;

  /**
   * Specifies how the end image will be rendered.
   */
  @property(NO_ATTRIBUTE) endImgType: Exclude<ImageRender, "img"> | undefined;

  /**
   * `true` if the control is the first item in the ch-segmented-control-render.
   */
  @property(BOOLEAN_TYPE_PROP) first: boolean = false;

  /**
   * `true` if the control is the last item in the ch-segmented-control-render.
   */
  @property(BOOLEAN_TYPE_PROP) last: boolean = false;

  /**
   * Specifies if the control is selected.
   */
  @property(BOOLEAN_TYPE_PROP) selected: boolean | undefined;

  /**
   * Specifies the src of the start image.
   */
  @property(NO_ATTRIBUTE) startImgSrc: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @property(NO_ATTRIBUTE) startImgType: Exclude<ImageRender, "img"> | undefined;

  // /**
  //  * Fired when the control is selected by user interaction.
  //  */
  // @Event() selectedChange: EventEmitter<string>;

  #parts = () =>
    `action${
      this.disabled ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.DISABLED}` : ""
    } ${
      this.selected
        ? SEGMENTED_CONTROL_PARTS_DICTIONARY.SELECTED
        : SEGMENTED_CONTROL_PARTS_DICTIONARY.UNSELECTED
    }${this.first ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.FIRST}` : ""}${
      this.last ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.LAST}` : ""
    }${this.between ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.BETWEEN}` : ""}`;

  #handleSelectedChange = (event: MouseEvent) => {
    event.stopPropagation();
    // this.selectedChange.emit(this.id);
  };

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "listitem");
  }

  override render() {
    const hasStartImg = !!this.startImgSrc;
    const hasEndImg = !!this.endImgSrc;
    const hasImages = hasStartImg || hasEndImg;

    return html`<button
      aria-label=${this.accessibleName || nothing}
      aria-selected=${this.selected ? "true" : nothing}
      class=${hasImages
        ? classMap({
            [`start-img-type--${this.startImgType ?? "background"} img--start`]:
              hasStartImg,
            [`end-img-type--${this.endImgType ?? "background"} img--end`]:
              hasEndImg
          })
        : nothing}
      part=${this.#parts()}
      style=${hasImages
        ? styleMap({
            "--ch-start-img": hasStartImg ? `url("${this.startImgSrc}")` : null,
            "--ch-end-img": hasEndImg ? `url("${this.endImgSrc}")` : null
          })
        : nothing}
      type="button"
      @click=${!this.selected ? this.#handleSelectedChange : null}
    >
      ${this.caption}
    </button>`;
  }
}

export default ChSegmentedControlItem;

declare global {
  interface HTMLElementTagNameMap {
    "ch-segmented-control-item": ChSegmentedControlItem;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChSegmentedControlItemElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSegmentedControlItemElement;
  }

  /**
   * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
   * This control represents and item of the ch-segmented-control-render
   *
   * @part selected - ...
   */// prettier-ignore
  interface HTMLChSegmentedControlItemElement extends ChSegmentedControlItem {
    // Extend the ChSegmentedControlItem class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-segmented-control-item": HTMLChSegmentedControlItemElement;
  }

  interface HTMLElementTagNameMap {
    "ch-segmented-control-item": HTMLChSegmentedControlItemElement;
  }
}

