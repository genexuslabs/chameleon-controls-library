import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  CHECKBOX_PARTS_DICTIONARY,
  DISABLED_CLASS
} from "../../common/reserved-names";

import {
  AccessibleNameComponent,
  DisableableComponent,
  FormComponent
} from "../../common/interfaces";
import type {
  ChameleonControlsTagName,
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { updateDirectionInImageCustomVar } from "../../common/utils";
import {
  DEFAULT_GET_IMAGE_PATH_CALLBACK,
  getControlRegisterProperty
} from "../../common/registry-properties";
import { getElementInternalsLabel } from "../../common/analysis/accessibility";

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
 * @part container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part input - The input element that implements the interactions for the component.
 * @part option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
 * @part label - The label that is rendered when the `caption` property is not empty.
 *
 * @part checked - Present in the `input`, `option`, `label` and `container` parts when the control is checked and not indeterminate (`value` === `checkedValue` and `indeterminate !== true`).
 * @part disabled - Present in the `input`, `option`, `label` and `container` parts when the control is disabled (`disabled` === `true`).
 * @part indeterminate - Present in the `input`, `option`, `label` and `container` parts when the control is indeterminate (`indeterminate` === `true`).
 * @part unchecked - Present in the `input`, `option`, `label` and `container` parts when the control is unchecked and not indeterminate (`value` === `unCheckedValue` and `indeterminate !== true`).
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "checkbox.scss",
  tag: "ch-checkbox"
})
export class ChCheckBox
  implements AccessibleNameComponent, DisableableComponent, FormComponent
{
  #accessibleNameFromExternalLabel: string | undefined;
  #startImage: GxImageMultiStateStart | undefined;

  // Refs
  #inputRef: HTMLInputElement;

  @AttachInternals() internals: ElementInternals;

  @Element() el!: HTMLChCheckboxElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * Specifies the label of the checkbox.
   */
  @Prop() readonly caption?: string;

  /**
   * The value when the checkbox is 'on'
   */
  @Prop() readonly checkedValue!: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
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
    this.#startImage = this.#computeImage();
  }

  /**
   * True to highlight control when an action is fired.
   */
  @Prop() readonly highlightable: boolean = false;

  /**
   * `true` if the control's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * Specifies the source of the start image.
   */
  @Prop() readonly startImgSrc: string;
  @Watch("startImgSrc")
  startImgSrcChanged() {
    this.#startImage = this.#computeImage();
  }

  /**
   * Specifies the source of the start image.
   */
  @Prop() readonly startImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * The value when the switch is 'off'. If you want to not add the value when
   * the control is used in a form and it's unchecked, just let this property
   * with the default `undefined` value.
   */
  @Prop() readonly unCheckedValue?: string | undefined;

  /**
   * The value of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChanged(newValue: string) {
    // Update form value
    this.internals.setFormValue(newValue?.toString());
  }

  /**
   * Emitted when the element is clicked or the space key is pressed and
   * released.
   */
  @Event() click: EventEmitter;

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   *
   * It contains the new value of the control.
   */
  @Event() input: EventEmitter<string>;

  #computeImage = (): GxImageMultiStateStart | null => {
    if (!this.startImgSrc) {
      return null;
    }
    const getImagePathCallback =
      this.getImagePathCallback ??
      getControlRegisterProperty("getImagePathCallback", "ch-checkbox") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    if (!getImagePathCallback) {
      return null;
    }
    const img = getImagePathCallback(this.startImgSrc);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : null;
  };

  #handleChange = (event: UIEvent) => {
    event.stopPropagation();
    this.#updateCheckedValueAndEmitEvent(this.#getInputRef().checked);

    // TODO: What's the need for this implementation in GeneXus
    if (this.highlightable) {
      this.click.emit();
    }
  };

  #handleHostClick = (event: MouseEvent) => {
    const clickWasPerformedInAExternalLabel = event.detail === 0;

    if (!clickWasPerformedInAExternalLabel) {
      event.stopPropagation();
      return;
    }

    // When the internal label is clicked it provokes a click in the input with
    // event.detail === 0
    if (event.composedPath()[0] !== this.#getInputRef()) {
      return this.#updateCheckedValueAndEmitEvent(!this.#getInputRef().checked);
    }

    const rootNode = this.el.getRootNode();

    // TODO: This is a WA to make work again the ch-checkbox inside the
    // ch-tree-view-item, because the Space key is not working
    if (
      rootNode instanceof ShadowRoot &&
      rootNode.host.tagName.toLowerCase() ===
        ("ch-tree-view-item" as ChameleonControlsTagName)
    ) {
      this.#updateCheckedValueAndEmitEvent(this.#getInputRef().checked);
    }
  };

  #updateCheckedValueAndEmitEvent = (checked: boolean) => {
    const value = checked ? this.checkedValue : this.unCheckedValue;

    this.value = value;
    this.#getInputRef().value = value; // Update input's value before emitting the event

    // When the checked value is updated by the user, the control must no
    // longer be indeterminate
    this.indeterminate = false;

    this.input.emit(value);
  };

  // TODO: There is a bug in StencilJS where we can't use the same variable for
  // conditional rendered refs
  #getInputRef = () =>
    this.#inputRef ?? this.el.shadowRoot.querySelector("input")!;

  #renderOption = (
    canAddListeners: boolean,
    checked: boolean,
    additionalParts: string
  ) => {
    return (
      <div
        class="container"
        part={`${CHECKBOX_PARTS_DICTIONARY.CONTAINER} ${additionalParts}`}
      >
        <input
          // TODO: Should we avoid setting the aria-label if the caption has the same value??
          aria-label={
            this.#accessibleNameFromExternalLabel ?? this.accessibleName
          }
          class="input"
          part={`${CHECKBOX_PARTS_DICTIONARY.INPUT} ${additionalParts}`}
          type="checkbox"
          checked={checked}
          disabled={this.disabled || this.readonly}
          indeterminate={this.indeterminate}
          value={this.value}
          onInput={canAddListeners && this.#handleChange}
          ref={el => (this.#inputRef = el)}
        />
        <div
          class={{
            option: true,
            "option--not-displayed": !checked && !this.indeterminate,
            "option--checked": checked && !this.indeterminate,
            "option--indeterminate": this.indeterminate
          }}
          part={`${CHECKBOX_PARTS_DICTIONARY.OPTION} ${additionalParts}`}
          aria-hidden="true"
        ></div>
      </div>
    );
  };

  connectedCallback() {
    this.#startImage = this.#computeImage();

    // Set initial value to unchecked if empty
    this.value ||= this.unCheckedValue;

    // Accessibility
    this.internals.setFormValue(this.value?.toString());
    const labels = this.internals.labels;
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

  render() {
    const checked = this.value === this.checkedValue;

    const additionalParts = PARTS(checked, this.indeterminate, this.disabled);
    const startImageClasses = this.#startImage?.classes;

    const canAddListeners = !this.disabled && !this.readonly;
    const hasStartImageStyles = !!this.#startImage?.styles;

    return (
      <Host
        class={{
          [DISABLED_CLASS]: this.disabled,
          "ch-checkbox--actionable":
            (!this.readonly && !this.disabled) ||
            (this.readonly && this.highlightable)
        }}
        onClickCapture={canAddListeners && this.#handleHostClick}
      >
        {this.caption || hasStartImageStyles ? (
          <label
            class={{
              label: true,

              [startImageClasses]: !!startImageClasses,
              [`start-img-type--${this.startImgType} pseudo-img--start`]:
                hasStartImageStyles
            }}
            part={`${CHECKBOX_PARTS_DICTIONARY.LABEL} ${additionalParts}`}
            style={hasStartImageStyles ? this.#startImage!.styles : undefined}
          >
            {this.#renderOption(canAddListeners, checked, additionalParts)}

            {this.caption}
          </label>
        ) : (
          this.#renderOption(canAddListeners, checked, additionalParts)
        )}
      </Host>
    );
  }
}
