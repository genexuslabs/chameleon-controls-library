import { ComponentInterface } from "@stencil/core";

export interface Component extends ComponentInterface {
  element?: any;
  render: () => void;
}
