/* STENCIL IMPORTS */
import { Component, Host, h, Prop, State } from "@stencil/core";
/* OTHER LIBRARIES IMPORTS */
/* CUSTOM IMPORTS */

@Component({
  tag: "ch-entity-selector",
  styleUrl: "ch-entity-selector.scss",
  shadow: true
})
export class ChEntitySelector {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API
5.EVENTS (EMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.WATCH
9.PUBLIC METHODS API
10.LOCAL METHODS
11.RENDER() FUNCTION

Code organization suggested by StencilJs:
https://stenciljs.com/docs/style-guide#code-organization
*/

  /// 1.OWN PROPERTIES ///

  /**
   *  This property provides the user a way to define custom aria-label descriptions.
   */
  @Prop() readonly accessibilityLabels?: EntitySelectorLabels = {
    buttonClearLabel: "clears the actual value",
    buttonSelectLabel: "displays the entity selector"
  };

  /**
   *  Default value to be assigned as the component's value. This value should always be used when the 'X' button is pressed.
   */
  @Prop() readonly defaultValue?: EntityData | null | undefined;

  /**
   * Optional label (same as the label of an input).
   */
  @Prop() readonly label: string;

  /**
   * Callback that will be called when the user presses the action button. Returns the new value assigned to the component.
   */
  @Prop() readonly onSelectEntity: () => Promise<EntityData>;

  /**
   * Value currently assigned.
   */
  @Prop({ mutable: true }) value: EntityData | null | undefined;

  /// 2. REFERENCE TO ELEMENTS ///

  /// 3.STATE() VARIABLES ///

  /**
   * This variable adds or removes a CSS class on the host, and it can be used to remove the focus-within styles from the host in the case the focus is on a button.
   */

  @State() buttonHasFocus = false;

  /// 4.PUBLIC PROPERTY API ///

  /// 5.EVENTS (EMIT) ///

  /// 6.COMPONENT LIFECYCLE EVENTS ///

  /// 7.LISTENERS ///

  /// 8.WATCH ///

  /// 9.PUBLIC METHODS API ///

  /// 10.LOCAL METHODS ///

  private btnClearClickHandler = () => {
    this.value = null;
  };

  private btnSelectClickHandler = () => {
    this.onSelectEntity()
      .then(result => {
        this.value = result;
      })
      .catch(error => {
        console.log("Promise rejected:", error);
      });
  };

  private iconAutoColor = (): boolean => {
    if (this.value) {
      return this.value.iconAutocolor;
    } else if (this.defaultValue) {
      return this.defaultValue.iconAutocolor;
    }
    return false;
  };

  private iconSrc = (): string | undefined => {
    if (this.value) {
      return this.value.iconSrc;
    } else if (this.defaultValue) {
      return this.defaultValue.iconSrc;
    }
    return undefined;
  };

  private buttonFocusHandler = (e: FocusEvent) => {
    if (e.type === "focus") {
      this.buttonHasFocus = true;
    } else if (e.type === "blur") {
      this.buttonHasFocus = false;
    }
  };

  /// 11.RENDER() FUNCTION ///

  render() {
    return (
      <Host
        class={{ "ch-entity-selector--button-has-focus": this.buttonHasFocus }}
      >
        {this.label && <label part="label">{this.label}</label>}
        <div part="wrapper">
          {this.iconSrc && (
            <ch-icon
              autoColor={this.iconAutoColor()}
              src={this.iconSrc()}
              part="icon"
              aria-hidden="true"
            ></ch-icon>
          )}
          <input
            type="text"
            readonly
            part="input input-entity"
            value={this.value?.name || this.defaultValue?.name}
          />
          <button
            part="button button-clear"
            onClick={this.btnClearClickHandler}
            aria-label={this.accessibilityLabels?.buttonClearLabel}
            onFocus={this.buttonFocusHandler}
            onBlur={this.buttonFocusHandler}
          ></button>
          <button
            part="button button-select"
            onClick={this.btnSelectClickHandler}
            aria-label={this.accessibilityLabels?.buttonSelectLabel}
            onFocus={this.buttonFocusHandler}
            onBlur={this.buttonFocusHandler}
          ></button>
        </div>
      </Host>
    );
  }
}

export type EntityData = {
  id: string; // Internal ID of the entity
  name: string; // Name that will be displayed in the interface
  iconSrc?: string; // The icon url src
  iconAutocolor?: boolean; // Indicates if the icon color is automatic or not. If it is, it ignores the value of '--icon-color'
};

export type EntitySelectorLabels = {
  buttonClearLabel: string;
  buttonSelectLabel: string;
};
