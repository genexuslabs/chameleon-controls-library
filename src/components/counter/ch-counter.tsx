import { Component, Element, Host, Prop, State, Watch, h } from "@stencil/core";

@Component({
  tag: "ch-counter",
  styleUrl: "ch-counter.scss",
  shadow: true
})
export class ChCounter {
  @Element() hostElement!: HTMLChCounterElement;
  /**
   * Represents the value of the input field.
   */
  @State() currentLength: number = 0;

  /**
   * Represents the maximum length of the input field.
   */
  @State() maxLength: number = 0;

  /**
   * Represents the initial value of the input field.
   * Note: This is required when component is updated by a parent component.
   */
  @Prop() readonly initialValue: string = "";
  @Watch("initialValue")
  initialValueChanged(newValue: string) {
    this.currentLength = newValue.length;
  }

  componentWillLoad() {
    const chEdit = this.hostElement.querySelector("ch-edit");

    chEdit?.addEventListener("input", (ev: Event) => {
      this.currentLength = (ev.target as HTMLInputElement).value.length;
    });

    this.currentLength = (chEdit?.value ?? this.initialValue).length;
    this.maxLength = chEdit?.maxLength ?? 0;
  }

  render() {
    const remainingChars = this.maxLength - this.currentLength;
    const isNearLimit = remainingChars <= 20;
    const isAtLimit = remainingChars <= 0;
    return (
      <Host>
        <slot></slot>

        {this.maxLength > 0 && (
          <div part="counter-container">
            <span
              class={{
                "counter-text": true,
                "counter-warning": isNearLimit && !isAtLimit,
                "counter-error": isAtLimit
              }}
              part="counter-text"
            >{`${this.currentLength} / ${this.maxLength}`}</span>
          </div>
        )}
      </Host>
    );
  }
}
