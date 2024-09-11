import { FlexibleLayoutModel } from "../../../components/flexible-layout/internal/flexible-layout/types";
import { SegmentedControlModel } from "../../../components/segmented-control/types";

export const ASIDE_WIDGET = "aside";
export const MAIN_WIDGET = "main";
export const HEADER_WIDGET = "header";
export const MAIN_SECTION = "main";
export const USAGE_STENCIL_JS = "usage (StencilJS)";
export const CONFIGURATION_WIDGET = "configuration";

export const flexibleLayoutConfiguration: FlexibleLayoutModel = {
  id: "root",
  direction: "rows",
  items: [
    {
      id: HEADER_WIDGET,
      size: "48px",
      type: "single-content",
      widget: { id: HEADER_WIDGET, name: "" },
      dragBar: { hidden: true }
    },
    {
      id: "rest",
      size: "1fr",
      direction: "columns",
      items: [
        {
          id: ASIDE_WIDGET,
          type: "single-content",
          size: "250px",
          minSize: "235px",
          dragBar: {
            hidden: false,
            size: 1
          },
          widget: { id: ASIDE_WIDGET, name: "" }
        },
        {
          id: MAIN_SECTION,
          type: "single-content",
          size: "1fr",
          minSize: "500px",
          widget: { id: MAIN_SECTION, name: "" }
        }
      ]
    }
  ]
};

export const flexibleLayoutPlaygroundConfiguration: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: MAIN_WIDGET,
      size: "1fr",
      minSize: "220px",
      selectedWidgetId: MAIN_WIDGET,
      tabDirection: "block",
      type: "tabbed",
      widgets: [
        { id: MAIN_WIDGET, name: "Playground" },
        { id: USAGE_STENCIL_JS, name: "Usage (StencilJS)" }
      ]
    },
    {
      id: CONFIGURATION_WIDGET,
      size: "320px",
      minSize: "250px",
      type: "single-content",
      widget: { id: CONFIGURATION_WIDGET, name: null }
    }
  ]
};

export const designSystemModel: SegmentedControlModel = [
  {
    id: "unanimo",
    caption: "Unanimo"
  },
  {
    id: "mercury",
    caption: "Mercury"
  }
];

export const colorSchemeModel: SegmentedControlModel = [
  {
    id: "light",
    caption: "Light"
  },
  {
    id: "dark",
    caption: "Dark"
  }
];

export const languageDirectionModel: SegmentedControlModel = [
  {
    id: "ltr",
    caption: "LTR"
  },
  {
    id: "rtl",
    caption: "RTL"
  }
];
