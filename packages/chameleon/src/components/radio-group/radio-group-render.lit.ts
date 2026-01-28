import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import { RADIO_ITEM_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/radio-group";
import type { RadioGroupItemModel, RadioGroupModel } from "./types";

import { IS_SERVER } from "../../development-flags";
import styles from "./radio-group-render.scss?inline";

const PARTS = (checked: boolean, disabled: boolean) => {
  const checkedValue = checked
    ? RADIO_ITEM_PARTS_DICTIONARY.CHECKED
    : RADIO_ITEM_PARTS_DICTIONARY.UNCHECKED;

  return disabled
    ? `${RADIO_ITEM_PARTS_DICTIONARY.DISABLED} ${checkedValue}`
    : checkedValue;
};

/**
 * The radio group control is used to render a short list of mutually exclusive options.
 *
 * It contains radio items to allow users to select one option from the list of options.
 *
 * @part radio__item - The radio item element.
 * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
 * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
 * @part radio__label - The label that is rendered when the `caption` property is not empty.
 *
 * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
 * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
 * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
 */
@Component({
  shadow: { delegatesFocus: true, formAssociated: true },
  styles,
  tag: "ch-radio-group-render"
})
export class ChRadioGroupRender extends KasstorElement {
  #internals = this.attachInternals();

  /**
   * Specifies the direction of the items.
   */
  @property({ reflect: true }) direction: "horizontal" | "vertical" =
    "horizontal";

  /**
   * This attribute lets you specify if the radio-group is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This property lets you define the items of the ch-radio-group-render control.
   */
  @property({ attribute: false }) model: RadioGroupModel | undefined;

  /**
   * Specifies the `name` of the component when used in a form.
   */
  @property({ noAccessor: true }) name: string | undefined;

  /**
   * The value of the control.
   */
  @property() value: string | undefined;
  @Observe("value")
  protected valueChanged(newValue: string | undefined) {
    // TODO: Should we validate that this is a valid value before updating the form???
    // Update form value
    this.#internals.setFormValue(newValue ?? null);
  }

  /**
   * Fired when the selected item change. It contains the information about the
   * new selected value.
   */
  @Event() protected change!: EventEmitter<string>;

  #handleCheckedInputChange = (value: string) => (event: InputEvent) => {
    event.stopPropagation();
    this.value = value;

    this.change.emit(value);
  };

  #itemRender = (item: RadioGroupItemModel, index: number) => {
    const { caption, value } = item;

    const checked = this.value === value;
    const disabled = item.disabled || this.disabled;

    const additionalParts = PARTS(checked, disabled);

    return html`<div
      class=${disabled ? "item" : "item item--enabled"}
      part="${RADIO_ITEM_PARTS_DICTIONARY.RADIO_ITEM} ${additionalParts}"
    >
      <div
        class=${checked ? "container" : "container container--checked"}
        part="${RADIO_ITEM_PARTS_DICTIONARY.CONTAINER} ${additionalParts}"
      >
        <input
          id=${index}
          name="radio"
          aria-label=${!caption ? item.accessibleName : nothing}
          class="input"
          part=${RADIO_ITEM_PARTS_DICTIONARY.INPUT}
          type="radio"
          .checked=${checked}
          .disabled=${disabled}
          .value=${value}
          @input=${this.#handleCheckedInputChange(value)}
        />
        <div
          aria-hidden="true"
          class=${checked ? "option" : "option option--unchecked"}
          part="${RADIO_ITEM_PARTS_DICTIONARY.OPTION} ${additionalParts}"
        ></div>
      </div>

      ${caption
        ? html`<label
            class="label"
            part="${RADIO_ITEM_PARTS_DICTIONARY.LABEL} ${additionalParts}"
            for=${index}
            >${caption}</label
          >`
        : nothing}
    </div>`;
  };

  override firstWillUpdate() {
    if (IS_SERVER) {
      return;
    }

    this.setAttribute("role", "radiogroup");

    // Set form value
    this.#internals.setFormValue(this.value ?? "");

    // TODO: Find the way to support label in the ch-radio-group-render
  }

  override render() {
    return this.model == null
      ? nothing
      : repeat(this.model, item => item.value, this.#itemRender);
  }
}

export default ChRadioGroupRender;

declare global {
  interface HTMLElementTagNameMap {
    "ch-radio-group-render": ChRadioGroupRender;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChRadioGroupRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChRadioGroupRenderElement;
  }

  /** Type of the `ch-radio-group-render`'s `change` event. */
  // prettier-ignore
  type HTMLChRadioGroupRenderElementChangeEvent = HTMLChRadioGroupRenderElementCustomEvent<
    HTMLChRadioGroupRenderElementEventMap["change"]
  >;

  interface HTMLChRadioGroupRenderElementEventMap {
    change: string;
  }

  interface HTMLChRadioGroupRenderElementEventTypes {
    change: HTMLChRadioGroupRenderElementChangeEvent;
  }

  /**
   * The radio group control is used to render a short list of mutually exclusive options.
   *
   * It contains radio items to allow users to select one option from the list of options.
   *
   * @part radio__item - The radio item element.
   * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
   * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
   * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
   * @part radio__label - The label that is rendered when the `caption` property is not empty.
   *
   * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
   * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
   * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
   *
   * @fires change Fired when the selected item change. It contains the information about the
   *   new selected value.
   */
  // prettier-ignore
  interface HTMLChRadioGroupRenderElement extends ChRadioGroupRender {
    // Extend the ChRadioGroupRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChRadioGroupRenderElementEventTypes>(type: K, listener: (this: HTMLChRadioGroupRenderElement, ev: HTMLChRadioGroupRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChRadioGroupRenderElementEventTypes>(type: K, listener: (this: HTMLChRadioGroupRenderElement, ev: HTMLChRadioGroupRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-radio-group-render": HTMLChRadioGroupRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-radio-group-render": HTMLChRadioGroupRenderElement;
  }
}

