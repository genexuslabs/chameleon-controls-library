import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { SEGMENTED_CONTROL_EXPORT_PARTS } from "../../utilities/reserved-names/parts/segmented-control";
import type { SegmentedControlItemModel, SegmentedControlModel } from "./types";

// Side-effect to define the segmented-control-item element
import "./internal/segmented-control-item/segmented-control-item.lit";

/**
 * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
 */
@Component({
  shadow: false,
  // styleUrl: "segmented-control-render.scss",
  tag: "ch-segmented-control-render"
})
export class ChSegmentedControlRender extends KasstorElement {
  /**
   * Specifies the parts that are exported by the internal
   * segmented-control-item. This property is useful to override the exported
   * parts.
   */
  // TODO: Remove this property when we add shadow dom support
  @property() exportParts: string = SEGMENTED_CONTROL_EXPORT_PARTS;

  /**
   * A CSS class to set as the `ch-segmented-control-item` element class.
   * This default class is used for the items that don't have an explicit class.
   */
  @property() itemCssClass: string = "segmented-control-item";

  /**
   * This property lets you define the items of the ch-segmented-control-render
   * control.
   */
  @property({ attribute: false }) model: SegmentedControlModel | undefined;

  /**
   * Specifies the ID of the selected item
   */
  // TODO: Should we rename this property to value???
  @property() selectedId: string | undefined;

  // /**
  //  * Fired when the selected item change. It contains the information about the
  //  * new selected id.
  //  */
  // @Event() selectedItemChange: EventEmitter<string>;

  // @Listen("selectedChange")
  // handleSelectedChange(event: ChSegmentedControlItemCustomEvent<string>) {
  //   event.stopPropagation();

  //   this.selectedId = event.detail;
  //   this.selectedItemChange.emit(event.detail);
  // }

  #itemRender = (item: SegmentedControlItemModel, index: number) => {
    const first = index === 0;
    const last = index === this.model!.length - 1;
    const between = !first && !last;

    return html`
      <ch-segmented-control-item
        id=${item.id}
        .accessibleName=${item.accessibleName}
        .between=${between}
        .caption=${item.caption}
        class=${item.class || this.itemCssClass}
        .disabled=${item.disabled}
        exportparts=${this.exportParts}
        .endImgSrc=${item.endImgSrc}
        .endImgType=${item.endImgType}
        .first=${first}
        .last=${last}
        .selected=${this.selectedId === item.id}
        .startImgSrc=${item.startImgSrc}
        .startImgType=${item.startImgType}
      ></ch-segmented-control-item>
    `;
  };

  override render() {
    return repeat(this.model ?? [], item => item.id, this.#itemRender);
  }
}

export default ChSegmentedControlRender;

declare global {
  interface HTMLElementTagNameMap {
    "ch-segmented-control-render": ChSegmentedControlRender;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChSegmentedControlRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSegmentedControlRenderElement;
  }

  /**
   * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
   */// prettier-ignore
  interface HTMLChSegmentedControlRenderElement extends ChSegmentedControlRender {
    // Extend the ChSegmentedControlRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-segmented-control-render": HTMLChSegmentedControlRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-segmented-control-render": HTMLChSegmentedControlRenderElement;
  }
}

