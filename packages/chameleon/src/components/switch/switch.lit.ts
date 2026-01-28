import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { SWITCH_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/switch";

import { IS_SERVER } from "../../development-flags";
import styles from "./switch.scss?inline";

const PARTS = (checked: boolean, readonly: boolean, disabled: boolean) => {
  let additionalParts = checked
    ? SWITCH_PARTS_DICTIONARY.CHECKED
    : SWITCH_PARTS_DICTIONARY.UNCHECKED;

  if (readonly) {
    additionalParts += SWITCH_PARTS_DICTIONARY.READONLY;
  }

  if (disabled) {
    additionalParts += SWITCH_PARTS_DICTIONARY.DISABLED;
  }

  return additionalParts;
};

/**
 * @status experimental
 *
 * A switch/toggle control that enables you to select between options.
 *
 * @part track - The track of the switch element.
 * @part thumb - The thumb of the switch element.
 * @part caption - The caption (checked or unchecked) of the switch element.
 *
 * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).
 * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).
 * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).
 */
@Component({
  shadow: { delegatesFocus: true, formAssociated: true },
  styles,
  tag: "ch-switch"
})
export class ChSwitch extends KasstorElement {
  #accessibleNameFromExternalLabel: string | undefined;

  #internals = this.attachInternals();

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.asd123
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;

  /**
   * Caption displayed when the switch is 'on'
   */
  @property({ attribute: "checked-caption" }) checkedCaption:
    | string
    | undefined;

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
  @property({ type: Boolean }) checked: boolean = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * Specifies the `name` of the component when used in a form.
   */
  @property({ noAccessor: true }) name: string | undefined;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @property({ type: Boolean }) readonly: boolean = false;

  /**
   * Caption displayed when the switch is 'off'
   */
  @property({ attribute: "un-checked-caption" }) unCheckedCaption:
    | string
    | undefined;

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
   *
   * This event is preventable.
   */
  @Event() protected input!: EventEmitter<boolean>;

  #updateCheckedState = (event: UIEvent) => {
    event.stopPropagation();

    // TODO: Add a unit test for this
    // This prevents a double click that is fired when the ch-switch is used
    // inside a label. If we don't prevent this, clicking in the caption of the
    // ch-switch doesn't change the checked state of the component, because
    // this handler is called two times
    event.preventDefault();

    const newChecked = !this.checked;
    this.checked = newChecked;
    this.#setFormValue();

    const eventInfo = this.input.emit(newChecked);

    // TODO: Add a unit test for this.
    // Check if the event was defaultPrevented to rollback changes
    if (eventInfo.defaultPrevented) {
      this.checked = !newChecked;
      this.#setFormValue();
    }
  };

  #setFormValue = () =>
    this.#internals.setFormValue(this.checked ? this.value : null);

  override connectedCallback() {
    super.connectedCallback();

    // TODO: Fix and use the Host directive to conditional add it
    this.addEventListener("click", this.#updateCheckedState, { capture: true });
  }

  override firstWillUpdate(): void {
    if (IS_SERVER) {
      return;
    }

    // Accessibility
    this.#setFormValue();
    const labels = this.#internals.labels;
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
    const { checked, disabled, readonly } = this;

    const caption = checked ? this.checkedCaption : this.unCheckedCaption;
    const additionalParts = PARTS(checked, readonly, disabled);

    // Host(this, {
    //   events: {
    //     click: this.disabled || this.readonly ? null : this.#updateCheckedState
    //   }
    // });

    // TODO: We should consider adding a part for the switch class, called
    // container or something like that. Same goes for the ch-slider.
    // This part helps to improve the clickable area of the component

    return html`<button
      role="switch"
      aria-checked=${
        // TODO: Add a unit test for this, since it is always required
        checked ? "true" : "false"
      }
      aria-label=${this.#accessibleNameFromExternalLabel ??
      (this.accessibleName || nothing)}
      aria-readonly=${readonly ? "true" : nothing}
      class="switch"
      ?disabled=${disabled}
    >
      <div
        class="track"
        part="${SWITCH_PARTS_DICTIONARY.TRACK} ${additionalParts}"
      >
        <div
          class="thumb"
          part="${SWITCH_PARTS_DICTIONARY.THUMB} ${additionalParts}"
        ></div>
      </div>

      ${caption
        ? html`<span
            aria-hidden="true"
            class="caption"
            part="${SWITCH_PARTS_DICTIONARY.CAPTION} ${additionalParts}"
            >${caption}</span
          >`
        : nothing}
    </button>`;
  }
}

export default ChSwitch;

declare global {
  interface HTMLElementTagNameMap {
    "ch-switch": ChSwitch;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChSwitchElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSwitchElement;
  }

  /** Type of the `ch-switch`'s `input` event. */
  // prettier-ignore
  type HTMLChSwitchElementInputEvent = HTMLChSwitchElementCustomEvent<
    HTMLChSwitchElementEventMap["input"]
  >;

  interface HTMLChSwitchElementEventMap {
    input: boolean;
  }

  interface HTMLChSwitchElementEventTypes {
    input: HTMLChSwitchElementInputEvent;
  }

  /**
   * @status experimental
   *
   * A switch/toggle control that enables you to select between options.
   *
   * @part track - The track of the switch element.
   * @part thumb - The thumb of the switch element.
   * @part caption - The caption (checked or unchecked) of the switch element.
   *
   * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).
   * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).
   * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).
   *
   * @fires input The `input` event is emitted when a change to the element's checked state
   *   is committed by the user.
   *
   *   It contains the new checked state of the control.
   *
   *   This event is preventable.
   */
  // prettier-ignore
  interface HTMLChSwitchElement extends ChSwitch {
    // Extend the ChSwitch class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChSwitchElementEventTypes>(type: K, listener: (this: HTMLChSwitchElement, ev: HTMLChSwitchElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChSwitchElementEventTypes>(type: K, listener: (this: HTMLChSwitchElement, ev: HTMLChSwitchElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-switch": HTMLChSwitchElement;
  }

  interface HTMLElementTagNameMap {
    "ch-switch": HTMLChSwitchElement;
  }
}
