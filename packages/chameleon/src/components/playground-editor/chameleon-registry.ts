import { html } from "lit";

import type { ComponentRegistry } from "../json-render/types";

// Side-effects to register the components
import "../checkbox/checkbox.lit";
import "../code/code.lit";
import "../image/image.lit";
import "../radio-group/radio-group-render.lit";
import "../segmented-control/segmented-control-render.lit";
import "../slider/slider.lit";
import "../switch/switch.lit";

/**
 * Shared registry of Chameleon component renderers for the playground editor.
 * Each renderer binds component properties from `element.props` (resolved from
 * `$bindState` expressions) and writes back to the StateStore via `setState`
 * when the component fires input/change events.
 */
export const chameleonRegistry: ComponentRegistry = {
  "ch-checkbox": ({ element, bindings, setState }) => {
    const p = element.props as {
      checked?: boolean;
      caption?: string;
      disabled?: boolean;
      indeterminate?: boolean;
      accessibleName?: string;
      name?: string;
      readonly?: boolean;
      startImgSrc?: string;
      startImgType?: string;
      value?: string;
    };
    return html`<ch-checkbox
      .checked=${p.checked ?? false}
      .caption=${p.caption ?? ""}
      .disabled=${p.disabled ?? false}
      .indeterminate=${p.indeterminate ?? false}
      .accessibleName=${p.accessibleName ?? ""}
      .name=${p.name ?? ""}
      .readonly=${p.readonly ?? false}
      .startImgSrc=${p.startImgSrc ?? ""}
      .startImgType=${p.startImgType ?? "background"}
      .value=${p.value ?? "on"}
      @input=${(e: CustomEvent) => {
        if (bindings?.checked) setState(bindings.checked, e.detail);
      }}
    ></ch-checkbox>`;
  },

  "ch-code": ({ element }) => {
    const p = element.props as {
      language?: string;
      showIndicator?: boolean;
      value?: string;
    };
    return html`<ch-code
      .language=${p.language ?? "txt"}
      .showIndicator=${p.showIndicator ?? false}
      .value=${p.value ?? ""}
    ></ch-code>`;
  },

  "ch-image": ({ element }) => {
    const p = element.props as {
      disabled?: boolean;
      src?: string;
      type?: string;
    };
    return html`<ch-image
      .disabled=${p.disabled ?? false}
      .src=${p.src ?? ""}
      .type=${p.type ?? "background"}
    ></ch-image>`;
  },

  "ch-radio-group-render": ({ element }) => {
    const p = element.props as Record<string, unknown>;
    return html`<ch-radio-group-render
      .model=${p.model}
    ></ch-radio-group-render>`;
  },

  "ch-segmented-control-render": ({ element }) => {
    const p = element.props as Record<string, unknown>;
    return html`<ch-segmented-control-render
      .model=${p.model}
    ></ch-segmented-control-render>`;
  },

  "ch-slider": ({ element, bindings, setState }) => {
    const p = element.props as {
      accessibleName?: string;
      disabled?: boolean;
      maxValue?: number;
      minValue?: number;
      name?: string;
      showValue?: boolean;
      step?: number;
      value?: number;
    };
    return html`<ch-slider
      .accessibleName=${p.accessibleName ?? ""}
      .disabled=${p.disabled ?? false}
      .maxValue=${p.maxValue ?? 100}
      .minValue=${p.minValue ?? 0}
      .name=${p.name ?? ""}
      .showValue=${p.showValue ?? false}
      .step=${p.step ?? 1}
      .value=${p.value ?? 0}
      @input=${(e: CustomEvent) => {
        if (bindings?.value) setState(bindings.value, e.detail);
      }}
    ></ch-slider>`;
  },

  "ch-switch": ({ element, bindings, setState }) => {
    const p = element.props as {
      accessibleName?: string;
      checked?: boolean;
      checkedCaption?: string;
      disabled?: boolean;
      name?: string;
      readonly?: boolean;
      unCheckedCaption?: string;
      value?: string;
    };
    return html`<ch-switch
      .accessibleName=${p.accessibleName ?? ""}
      .checked=${p.checked ?? false}
      .checkedCaption=${p.checkedCaption ?? ""}
      .disabled=${p.disabled ?? false}
      .name=${p.name ?? ""}
      .readonly=${p.readonly ?? false}
      .unCheckedCaption=${p.unCheckedCaption ?? ""}
      .value=${p.value ?? "on"}
      @input=${(e: CustomEvent) => {
        if (bindings?.checked) setState(bindings.checked, e.detail);
      }}
    ></ch-switch>`;
  }
};
