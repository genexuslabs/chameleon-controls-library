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

import { getElementInternalsLabel } from "../../common/analysis/accessibility";
import {
  AccessibleNameComponent,
  DisableableComponent,
  FormComponent
} from "../../common/interfaces";
import {
  DEFAULT_GET_IMAGE_PATH_CALLBACK,
  getControlRegisterProperty
} from "../../common/registry-properties";
import type {
  ChameleonControlsTagName,
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { updateDirectionInImageCustomVar } from "../../common/utils";

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
 * The `ch-checkbox` component is a form-associated checkbox control that allows users to toggle between checked, unchecked, and optionally indeterminate states.
 *
 * @remarks
 * ## Features
 *  - Tri-state support: checked, unchecked, and indeterminate.
 *  - Optional label and start images with multi-state support (hover, active, focus, disabled).
 *  - Read-only mode to prevent user modifications.
 *  - Form-associated via `ElementInternals` for native form participation.
 *  - Accessible name resolution from external `<label>` elements via `ElementInternals.labels`.
 *
 * ## Use when
 *  - A binary or tri-state selection is needed in forms, settings panels, or tree views.
 *  - Multiple independent options can be selected from a list.
 *  - Filtering content where multiple criteria can apply simultaneously.
 *  - Batch operations in data tables (e.g., select-all rows).
 *  - Acknowledging terms or conditions before submitting a form.
 *
 * ## Do not use when
 *  - The semantics are closer to an on/off toggle — prefer `ch-switch` instead.
 *  - Only one option can be selected from a group — prefer `ch-radio-group-render` instead.
 *  - The change must take immediate effect without a confirmation step — prefer `ch-switch` instead.
 *  - The list of options exceeds 7 items — prefer `ch-combo-box-render` with multiple selection instead.
 *  - A single checkbox is used in isolation as a binary toggle for a live system setting — prefer `ch-switch`.
 *
 * ## Slots
 * This component does not project any slots. All content is rendered from the `caption` and `startImgSrc` properties.
 *
 * ## Accessibility
 *  - Uses a native `<input type="checkbox">` internally, providing built-in ARIA semantics.
 *  - Form-associated via `ElementInternals` — participates in native form validation and submission.
 *  - Delegates focus into the shadow DOM (`delegatesFocus: true`), so clicking the host or an associated external `<label>` automatically focuses the internal input.
 *  - Resolves its accessible name from an external `<label>` element (via `ElementInternals.labels`) or the `accessibleName` property. The external label takes priority.
 *  - The decorative option overlay is hidden from assistive technology with `aria-hidden`.
 *  - Keyboard: Space toggles the checkbox (native `<input type="checkbox">` behavior). Tab moves focus in/out.
 *  - The `indeterminate` IDL property is set on the native input, so screen readers announce the mixed state.
 *
 * @status developer-preview
 *
 * @part container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part input - The native `<input type="checkbox">` element that implements the interactions for the component.
 * @part option - The decorative overlay rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`, and is always `aria-hidden`.
 * @part label - The `<label>` element that wraps the checkbox and caption text. Only present when `caption` is set or `startImgSrc` resolves to a valid image.
 *
 * @part checked - Present in the `input`, `option`, `label` and `container` parts when the control is checked and not indeterminate (`value` === `checkedValue` and `indeterminate !== true`).
 * @part disabled - Present in the `input`, `option`, `label` and `container` parts when the control is disabled (`disabled` === `true`).
 * @part indeterminate - Present in the `input`, `option`, `label` and `container` parts when the control is indeterminate (`indeterminate` === `true`). Takes precedence over `checked`/`unchecked`.
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
   * Specifies the visible label text of the checkbox. When set (or when
   * `startImgSrc` resolves to a valid image), the checkbox is wrapped in a
   * `<label>` element that also exposes the `label` part.
   */
  @Prop() readonly caption?: string;

  /**
   * The value assigned to the control when it is checked. This property is
   * required — the component determines its checked state by comparing
   * `value === checkedValue`.
   */
  @Prop() readonly checkedValue!: string;

  /**
   * If `true`, the checkbox is disabled: it will not respond to user
   * interaction and will not fire any events. The internal `<input>` receives
   * the native `disabled` attribute, and the `disabled` state part is added
   * to all structural parts.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * A callback executed when `startImgSrc` needs to be resolved into a
   * multi-state image object (`GxImageMultiState`). If not provided, the
   * component falls back to the global registry
   * (`getControlRegisterProperty("getImagePathCallback", "ch-checkbox")`),
   * then to `DEFAULT_GET_IMAGE_PATH_CALLBACK`.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#startImage = this.#computeImage();
  }

  /**
   * When `true`, the control emits the `click` event after each value change
   * and applies the `ch-checkbox--actionable` CSS class even in `readonly`
   * mode. This is a GeneXus-specific behavior for action highlighting.
   */
  @Prop() readonly highlightable: boolean = false;

  /**
   * `true` if the control's value is indeterminate (mixed state). When
   * `indeterminate` is `true`, neither the `checked` nor `unchecked` state
   * parts are applied — only the `indeterminate` part is present.
   *
   * This property is automatically reset to `false` on any user interaction
   * (toggle). To re-enter the indeterminate state, the parent must set
   * this property again from the outside.
   */
  @Prop({ mutable: true }) indeterminate: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * When `true`, the user cannot modify the value of the control.
   * Internally, this sets `disabled` on the native `<input>` (since
   * `<input type="checkbox">` does not support the HTML `readonly`
   * attribute). Unlike `disabled`, the form value is still submitted.
   *
   * If both `readonly` and `highlightable` are `true`, the
   * `ch-checkbox--actionable` class is still applied.
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
   * Specifies the rendering mode for the start image. `"background"` uses
   * a CSS `background-image`, while `"mask"` uses `-webkit-mask` (which
   * allows the image to inherit `currentColor`).
   */
  @Prop() readonly startImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * The value assigned to the control when it is unchecked. If left as
   * `undefined`, no value is submitted in forms when the checkbox is off.
   * Also used as the initial value in `connectedCallback` when `value` is
   * not set.
   */
  @Prop() readonly unCheckedValue?: string | undefined;

  /**
   * The current value of the control. The checked state is derived from
   * `value === checkedValue`. When changed externally, the form value is
   * updated via `ElementInternals.setFormValue()`.
   *
   * Mutated internally on user interaction: set to `checkedValue` when
   * toggled on, or `unCheckedValue` when toggled off.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChanged(newValue: string) {
    // Update form value
    this.internals.setFormValue(newValue?.toString());
  }

  /**
   * Emitted after a value change **only when `highlightable` is `true`**.
   * This is a GeneXus-specific event for action highlighting — it does
   * NOT fire on every click or space press by default.
   */
  @Event() click: EventEmitter;

  /**
   * Emitted when the user toggles the checkbox (via click, Space key, or
   * external label activation). Contains the new `value` string
   * (`checkedValue` or `unCheckedValue`). The native input event is
   * stopped from propagating.
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
