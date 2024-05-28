import { ComponentInterface } from "@stencil/core";

export interface AccessibleNameComponent {
  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  accessibleName?: string;
}

export interface DisableableComponent {
  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event).
   */
  disabled: boolean;
}

export interface FormComponent {
  /**
   * This property specifies the `name` of the control when used in a form.
   */
  name?: string;

  /**
   * This property specifies the value of the control.
   */
  value?: string;
}

export interface Component extends ComponentInterface {
  element?: any;
  render: () => any;
}
