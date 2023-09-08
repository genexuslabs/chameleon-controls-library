import { ComponentInterface } from "@stencil/core";

export interface AccessibleNameComponent {
  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  accessibleName: string;
}

export interface DisableableComponent {
  disabled: boolean;
}

export interface Component extends ComponentInterface {
  element?: any;
  render: () => any;
}
