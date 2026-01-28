import type { nothing, TemplateResult } from "lit";

export type RouterModel = Record<string, RouterItemModel>;

export type RouterItemModel = {
  render: (
    children?: TemplateResult | undefined | typeof nothing
  ) => TemplateResult | undefined | typeof nothing;
  children?: RouterModel;
};

