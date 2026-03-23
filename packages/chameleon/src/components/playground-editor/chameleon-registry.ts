import { html } from "lit";

import type { ComponentRegistry } from "../json-render/types";

// Side-effects to register the components
import "../accordion/accordion.lit";
import "../action-group/action-group-render.lit";
import "../action-list/action-list-render.lit";
import "../action-menu/action-menu-render.lit";
import "../checkbox/checkbox.lit";
import "../code/code.lit";
import "../combo-box/combo-box.lit";
import "../image/image.lit";
import "../math-viewer/math-viewer.lit";
import "../popover/popover.lit";
import "../qr/qr.lit";
import "../radio-group/radio-group-render.lit";
import "../segmented-control/segmented-control-render.lit";
import "../sidebar/sidebar.lit";
import "../slider/slider.lit";
import "../status/status.lit";
import "../switch/switch.lit";
import "../tab/tab.lit";

/**
 * Shared registry of Chameleon component renderers for the playground editor.
 * Each renderer binds component properties from `element.props` (resolved from
 * `$bindState` expressions) and writes back to the StateStore via `setState`
 * when the component fires input/change events.
 */
// Default models for complex components used in playground renderers
const ACCORDION_DEFAULT_MODEL = [
  { id: "section-1", caption: "Section 1", expanded: true },
  { id: "section-2", caption: "Section 2", expanded: false },
  { id: "section-3", caption: "Section 3", expanded: false }
];

const ACTION_GROUP_DEFAULT_MODEL = [
  { caption: "Copy" },
  { caption: "Paste" },
  { caption: "Cut" }
];

const ACTION_LIST_DEFAULT_MODEL = [
  { id: "item-1", caption: "First item", type: "actionable" as const },
  { id: "item-2", caption: "Second item", type: "actionable" as const },
  { type: "separator" as const },
  { id: "item-3", caption: "Third item", type: "actionable" as const }
];

const ACTION_MENU_DEFAULT_MODEL = [
  { caption: "Edit" },
  { caption: "Duplicate" },
  { type: "separator" as const },
  { caption: "Delete" }
];

const COMBO_BOX_DEFAULT_MODEL = [
  { value: "opt-1", caption: "Option 1" },
  { value: "opt-2", caption: "Option 2" },
  { value: "opt-3", caption: "Option 3" }
];

const RADIO_GROUP_DEFAULT_MODEL = [
  { id: "small", caption: "Small" },
  { id: "medium", caption: "Medium" },
  { id: "large", caption: "Large" }
];

const TAB_DEFAULT_MODEL = [
  { id: "tab-1", name: "Overview" },
  { id: "tab-2", name: "Details" },
  { id: "tab-3", name: "Settings" }
];

export const chameleonRegistry: ComponentRegistry = {
  "ch-accordion-render": ({ element }) => {
    const p = element.props as {
      disabled?: boolean;
      expandableButtonPosition?: string;
      singleItemExpanded?: boolean;
    };
    return html`<ch-accordion-render
      .model=${ACCORDION_DEFAULT_MODEL}
      .disabled=${p.disabled ?? false}
      .expandableButtonPosition=${p.expandableButtonPosition ?? "end"}
      .singleItemExpanded=${p.singleItemExpanded ?? false}
    >
      <div slot="section-1" style="padding: 12px; font-size: 13px;">Content for Section 1</div>
      <div slot="section-2" style="padding: 12px; font-size: 13px;">Content for Section 2</div>
      <div slot="section-3" style="padding: 12px; font-size: 13px;">Content for Section 3</div>
    </ch-accordion-render>`;
  },

  "ch-action-group-render": ({ element }) => {
    const p = element.props as {
      disabled?: boolean;
      itemsOverflowBehavior?: string;
    };
    return html`<ch-action-group-render
      .model=${ACTION_GROUP_DEFAULT_MODEL}
      .disabled=${p.disabled ?? false}
      .itemsOverflowBehavior=${p.itemsOverflowBehavior ?? "responsive-collapse"}
    ></ch-action-group-render>`;
  },

  "ch-action-list-render": ({ element }) => {
    const p = element.props as {
      checkbox?: boolean;
      disabled?: boolean;
      editableItems?: boolean;
      selection?: string;
    };
    return html`<ch-action-list-render
      .model=${ACTION_LIST_DEFAULT_MODEL}
      .checkbox=${p.checkbox ?? false}
      .disabled=${p.disabled ?? false}
      .editableItems=${p.editableItems ?? true}
      .selection=${p.selection ?? "none"}
    ></ch-action-list-render>`;
  },

  "ch-action-menu-render": ({ element }) => {
    const p = element.props as {
      blockAlign?: string;
      buttonAccessibleName?: string;
      disabled?: boolean;
      expanded?: boolean;
      inlineAlign?: string;
      positionTry?: string;
    };
    return html`<ch-action-menu-render
      .model=${ACTION_MENU_DEFAULT_MODEL}
      .blockAlign=${p.blockAlign ?? "outside-end"}
      .buttonAccessibleName=${p.buttonAccessibleName ?? "Actions"}
      .disabled=${p.disabled ?? false}
      .expanded=${p.expanded ?? false}
      .inlineAlign=${p.inlineAlign ?? "center"}
      .positionTry=${p.positionTry ?? "none"}
    ></ch-action-menu-render>`;
  },

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

  "ch-combo-box-render": ({ element }) => {
    const p = element.props as {
      accessibleName?: string;
      disabled?: boolean;
      placeholder?: string;
      readonly?: boolean;
      suggest?: boolean;
      value?: string;
    };
    return html`<ch-combo-box-render
      .model=${COMBO_BOX_DEFAULT_MODEL}
      .accessibleName=${p.accessibleName ?? ""}
      .disabled=${p.disabled ?? false}
      .placeholder=${p.placeholder ?? ""}
      .readonly=${p.readonly ?? false}
      .suggest=${p.suggest ?? false}
      .value=${p.value ?? "opt-1"}
    ></ch-combo-box-render>`;
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

  "ch-math-viewer": ({ element }) => {
    const p = element.props as {
      displayMode?: string;
      value?: string;
    };
    return html`<ch-math-viewer
      .displayMode=${p.displayMode ?? "block"}
      .value=${p.value ?? "E = mc^2"}
    ></ch-math-viewer>`;
  },

  "ch-popover": ({ element }) => {
    const p = element.props as {
      allowDrag?: string;
      blockAlign?: string;
      blockSizeMatch?: string;
      closeOnClickOutside?: boolean;
      inlineAlign?: string;
      inlineSizeMatch?: string;
      mode?: string;
      overflowBehavior?: string;
      positionTry?: string;
      resizable?: boolean;
      show?: boolean;
    };
    return html`<div style="position: relative; min-height: 120px;">
      <ch-popover
        .allowDrag=${p.allowDrag ?? "no"}
        .blockAlign=${p.blockAlign ?? "center"}
        .blockSizeMatch=${p.blockSizeMatch ?? "content"}
        .closeOnClickOutside=${p.closeOnClickOutside ?? false}
        .inlineAlign=${p.inlineAlign ?? "center"}
        .inlineSizeMatch=${p.inlineSizeMatch ?? "content"}
        .mode=${p.mode ?? "auto"}
        .overflowBehavior=${p.overflowBehavior ?? "overflow"}
        .positionTry=${p.positionTry ?? "none"}
        .resizable=${p.resizable ?? false}
        .show=${p.show ?? false}
        style="padding: 12px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;"
      >Popover content</ch-popover>
    </div>`;
  },

  "ch-qr": ({ element }) => {
    const p = element.props as {
      accessibleName?: string;
      background?: string;
      errorCorrectionLevel?: string;
      fill?: string;
      radius?: number;
      size?: number;
      value?: string;
    };
    return html`<ch-qr
      .accessibleName=${p.accessibleName ?? ""}
      .background=${p.background ?? "white"}
      .errorCorrectionLevel=${p.errorCorrectionLevel ?? "High"}
      .fill=${p.fill ?? "black"}
      .radius=${p.radius ?? 0}
      .size=${p.size ?? 128}
      .value=${p.value ?? "https://chameleon.genexus.com"}
    ></ch-qr>`;
  },

  "ch-radio-group-render": ({ element }) => {
    const p = element.props as {
      direction?: string;
      disabled?: boolean;
      name?: string;
      value?: string;
    };
    return html`<ch-radio-group-render
      .model=${RADIO_GROUP_DEFAULT_MODEL}
      .direction=${p.direction ?? "horizontal"}
      .disabled=${p.disabled ?? false}
      .name=${p.name ?? ""}
      .value=${p.value ?? "medium"}
    ></ch-radio-group-render>`;
  },

  "ch-segmented-control-render": ({ element }) => {
    const p = element.props as Record<string, unknown>;
    return html`<ch-segmented-control-render
      .model=${p.model}
    ></ch-segmented-control-render>`;
  },

  "ch-sidebar": ({ element }) => {
    const p = element.props as {
      expandButtonCollapseCaption?: string;
      expandButtonExpandCaption?: string;
      expandButtonPosition?: string;
      expanded?: boolean;
      showExpandButton?: boolean;
    };
    return html`<div style="display: flex; height: 160px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
      <ch-sidebar
        .expandButtonCollapseCaption=${p.expandButtonCollapseCaption ?? ""}
        .expandButtonExpandCaption=${p.expandButtonExpandCaption ?? ""}
        .expandButtonPosition=${p.expandButtonPosition ?? "after"}
        .expanded=${p.expanded ?? true}
        .showExpandButton=${p.showExpandButton ?? false}
        style="border-inline-end: 1px solid #e5e7eb;"
      >
        <nav style="padding: 8px; font-size: 13px;">Navigation links</nav>
      </ch-sidebar>
      <main style="padding: 16px; flex: 1; font-size: 13px;">Page content</main>
    </div>`;
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

  "ch-status": ({ element }) => {
    const p = element.props as {
      accessibleName?: string;
    };
    return html`<ch-status
      .accessibleName=${p.accessibleName ?? "Loading"}
    ></ch-status>`;
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
  },

  "ch-tab-render": ({ element }) => {
    const p = element.props as {
      closeButton?: boolean;
      disabled?: boolean;
      selectedId?: string;
      showCaptions?: boolean;
      sortable?: boolean;
      tabListPosition?: string;
    };
    return html`<ch-tab-render
      .model=${TAB_DEFAULT_MODEL}
      .closeButton=${p.closeButton ?? false}
      .disabled=${p.disabled ?? false}
      .selectedId=${p.selectedId ?? "tab-1"}
      .showCaptions=${p.showCaptions ?? true}
      .sortable=${p.sortable ?? false}
      .tabListPosition=${p.tabListPosition ?? "block-start"}
      style="height: 160px;"
    >
      <div slot="tab-1" style="padding: 12px; font-size: 13px;">Overview content</div>
      <div slot="tab-2" style="padding: 12px; font-size: 13px;">Details content</div>
      <div slot="tab-3" style="padding: 12px; font-size: 13px;">Settings content</div>
    </ch-tab-render>`;
  }
};
