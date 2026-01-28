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

import { IS_SERVER } from "../../development-flags";
import type {
  GetImagePathCallback,
  ImageRender
} from "../../typings/multi-state-images";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { CHECKBOX_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/checkbox";

import styles from "./checkbox.scss?inline";

// In the server we need to preload the ch-image just in case to properly
// render it, because Lit doesn't support async rendering in the server.
// In the client we can lazy load the ch-image, since not all ch-checkbox will
// use an icon
if (IS_SERVER) {
  await import("../image/image.lit");
}

const BOOLEAN_TYPE_PROP = { type: Boolean };

const PARTS = (checked: boolean, indeterminate: boolean, disabled: boolean) => {
  if (indeterminate) {
    return disabled
      ? `${CHECKBOX_PARTS_DICTIONARY.DISABLED} ${CHECKBOX_PARTS_DICTIONARY.INDETERMINATE}`
      : CHECKBOX_PARTS_DICTIONARY.INDETERMINATE;
  }

  const checkedValue = checked
    ? CHECKBOX_PARTS_DICTIONARY.CHECKED
    : CHECKBOX_PARTS_DICTIONARY.UNCHECKED;

  return disabled
    ? `${CHECKBOX_PARTS_DICTIONARY.DISABLED} ${checkedValue}`
    : checkedValue;
};

/**
 * @status developer-preview
 *
 * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @csspart input - The input element that implements the interactions for the component.
 * @csspart label - The label that is rendered when the `caption` property is not empty.
 *
 * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).
 * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).
 * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).
 * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).

 * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.
 *
 * @cssprop [--ch-checkbox__checked-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")] - Specifies the image of the checkbox when is checked.
 *
 * @cssprop [--ch-checkbox__option-indeterminate-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>")] - Specifies the image of the checkbox when is indeterminate.
 *
 * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.
 *
 * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.
 * 
 * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.
 */
@Component({
  shadow: { delegatesFocus: true, formAssociated: true },
  styles,
  tag: "ch-checkbox"
})
export class ChCheckbox extends KasstorElement {
  #accessibleNameFromExternalLabel: string | undefined;

  /**
   * We track if the checkbox has a label on the initial load, to avoid setting
   * a click listener on the host, since that listener is only necessary when
   * the component has a external label.
   *
   * We can't rely on the #accessibleNameFromExternalLabel member, since on the
   * initial load the `ch-checkbox` can have a label associated the
   * `textContent` could be undefined if the translations for the label are
   * lazy loaded.
   */
  #hasExternalLabel: boolean = false;

  #internals = this.attachInternals();

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;

  /**
   * Specifies the label of the checkbox.
   */
  @property() caption: string | undefined;

  /**
   * `true` if the `ch-switch` is checked.
   *
   * If checked:
   *   - The `value` property will be available in the parent `<form>` if the
   *     `name` attribute is set.
   *   - The `checkedCaption` will be used to display the current caption.
   *
   * If not checked:
   *   - The `value` property won't be available in the parent `<form>`, even
   *     if the `name` attribute is set.
   *   - The `unCheckedCaption` will be used to display the current caption.
   */
  @property(BOOLEAN_TYPE_PROP) checked: boolean = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | GetImagePathCallback
    | undefined;

  /**
   * `true` if the control's value is indeterminate.
   *
   * This property is purely a visual change. It has no impact on whether the
   * checkbox's is used in a form submission. That is decided by the
   * `checked` property, regardless of the `indeterminate` state.
   */
  @property(BOOLEAN_TYPE_PROP) indeterminate: boolean = false;

  /**
   * Specifies the `name` of the component when used in a form.
   */
  @property({ noAccessor: true }) name: string | undefined;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @property(BOOLEAN_TYPE_PROP) readonly: boolean = false;

  /**
   * Specifies the source of the start image.
   */
  @property({ attribute: "start-img-src" }) startImgSrc: string | undefined;

  /**
   * Specifies the source of the start image.
   */
  @property({ attribute: "start-img-type" }) startImgType: Exclude<
    ImageRender,
    "img"
  > = "background";

  /**
   * The value of the control.
   */
  @property() value: string = "on";
  @Observe(["checked", "value"])
  protected checkedOrValueChanged() {
    // TODO: Add a unit test for this
    this.#setFormValue();
  }

  /**
   * The `input` event is emitted when a change to the element's checked state
   * is committed by the user.
   *
   * It contains the new checked state of the control.
   */
  @Event() protected input!: EventEmitter<boolean>;

  #updateCheckedState = (event: UIEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const lastIndeterminateValue = this.indeterminate;
    const newChecked = !this.checked;
    this.checked = newChecked;

    // TODO: Add a unit test for this
    // When the checked value is updated by the user, the control must no
    // longer be indeterminate
    this.indeterminate = false;

    const eventInfo = this.input.emit(newChecked);

    // TODO: Add a unit test for this.
    // Check if the event was defaultPrevented to rollback changes
    if (eventInfo.defaultPrevented) {
      this.checked = !newChecked;
      this.indeterminate = lastIndeterminateValue;
      this.#setFormValue();
    }
  };

  #getCheckedValue = (): "mixed" | "true" | "false" =>
    this.indeterminate ? "mixed" : `${this.checked}`;

  #renderOptionContainer = (
    canAddListeners: boolean,
    checkedState: "mixed" | "true" | "false",
    additionalParts: string
  ) =>
    // TODO: Set aria-disabled="false" when the ch-checkbox is readonly and !disabled
    html`<div
      class="container container--${checkedState}"
      part="${CHECKBOX_PARTS_DICTIONARY.CONTAINER} ${additionalParts}"
    >
      <input
        aria-label=${this.#accessibleNameFromExternalLabel ??
        (this.accessibleName || nothing)}
        aria-disabled=${!this.disabled && this.readonly ? "false" : nothing}
        class=${canAddListeners ? "input actionable" : "input"}
        part="${CHECKBOX_PARTS_DICTIONARY.INPUT} ${additionalParts}"
        type="checkbox"
        .disabled=${
          // Don't use the ?disabled binding, since it won't remove the
          // disabled attribute in runtime
          !canAddListeners
        }
        @input=${canAddListeners ? this.#updateCheckedState : nothing}
      />
    </div>`;

  #setFormValue = () =>
    this.#internals.setFormValue(this.checked ? this.value : null);

  protected override firstWillUpdate(): void {
    if (IS_SERVER) {
      return;
    }

    // Accessibility
    this.#setFormValue();
    const labels = this.#internals.labels;

    this.#hasExternalLabel = labels.length !== 0;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue. TODO: It should take into account the caption property
    // analyzeLabelExistence(
    //   this.el,
    //   "ch-checkbox",
    //   labels,
    //   this.#accessibleNameFromExternalLabel,
    //   this.accessibleName
    // );
  }

  override render() {
    const checkedState = this.#getCheckedValue();

    const additionalParts = PARTS(
      this.checked,
      this.indeterminate,
      this.disabled
    );

    const canAddListeners = !this.disabled && !this.readonly;
    const hasStartImage = !!this.startImgSrc;

    // TODO: Fix and use the Host directive to conditional add it
    if (this.#hasExternalLabel) {
      this.addEventListener("click", this.#updateCheckedState, {
        capture: true
      });
    }

    // TODO: Add unit tests for checking that the button has type="button"
    return this.caption || hasStartImage
      ? html`<label
          class=${canAddListeners ? "label actionable" : "label"}
          part="${CHECKBOX_PARTS_DICTIONARY.LABEL} ${additionalParts}"
        >
          ${this.#renderOptionContainer(
            canAddListeners,
            checkedState,
            additionalParts
          )}
          ${hasStartImage
            ? html`<ch-image
                .disabled=${this.disabled}
                .getImagePathCallback=${this.getImagePathCallback}
                .src=${this.startImgSrc}
                .type=${this.startImgType}
              ></ch-image>`
            : nothing}
          ${this.caption}
        </label>`
      : this.#renderOptionContainer(
          canAddListeners,
          checkedState,
          additionalParts
        );
  }
}

export default ChCheckbox;

declare global {
  interface HTMLElementTagNameMap {
    "ch-checkbox": ChCheckbox;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChCheckboxElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChCheckboxElement;
  }

  /** Type of the `ch-checkbox`'s `input` event. */
  // prettier-ignore
  type HTMLChCheckboxElementInputEvent = HTMLChCheckboxElementCustomEvent<
    HTMLChCheckboxElementEventMap["input"]
  >;

  interface HTMLChCheckboxElementEventMap {
    input: boolean;
  }

  interface HTMLChCheckboxElementEventTypes {
    input: HTMLChCheckboxElementInputEvent;
  }

  /**
   * @status developer-preview
   *
   * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.
   * @csspart input - The input element that implements the interactions for the component.
   * @csspart label - The label that is rendered when the `caption` property is not empty.
   *
   * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).
   * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).
   * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).
   * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).
  
   * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.
   *
   * @cssprop [--ch-checkbox__checked-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")] - Specifies the image of the checkbox when is checked.
   *
   * @cssprop [--ch-checkbox__option-indeterminate-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>")] - Specifies the image of the checkbox when is indeterminate.
   *
   * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.
   *
   * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.
   * 
   * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.
   *
   * @fires input The `input` event is emitted when a change to the element's checked state
   *   is committed by the user.
   *   
   *   It contains the new checked state of the control.
   */
  // prettier-ignore
  interface HTMLChCheckboxElement extends ChCheckbox {
    // Extend the ChCheckbox class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChCheckboxElementEventTypes>(type: K, listener: (this: HTMLChCheckboxElement, ev: HTMLChCheckboxElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChCheckboxElementEventTypes>(type: K, listener: (this: HTMLChCheckboxElement, ev: HTMLChCheckboxElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-checkbox": HTMLChCheckboxElement;
  }

  interface HTMLElementTagNameMap {
    "ch-checkbox": HTMLChCheckboxElement;
  }
}

