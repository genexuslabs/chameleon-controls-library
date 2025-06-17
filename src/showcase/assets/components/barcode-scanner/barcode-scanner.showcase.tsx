import { h } from "@stencil/core";
import { ChBarcodeScannerCustomEvent } from "../../../../components";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties, updateShowcase } from "../utils";

const state: Partial<HTMLChBarcodeScannerElement> = {};

let lastRead: string;

const handleRead = (event: ChBarcodeScannerCustomEvent<string>) => {
  lastRead = event.detail;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const render = () => (
  // TODO: The slot is a WA to avoid issues with Shadow DOM. See the render of
  // the showcase.tsx
  <div class="barcode-scanner-test-main-wrapper" slot="ch-barcode-scanner">
    <ch-barcode-scanner
      barcodeBoxWidth={state.barcodeBoxWidth}
      barcodeBoxHeight={state.barcodeBoxHeight}
      scanning={state.scanning}
      onRead={handleRead}
    ></ch-barcode-scanner>

    <span>Content: {lastRead}</span>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChBarcodeScannerElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "barcodeBoxWidth",
          caption: "Barcode Box Width",
          value: 200,
          type: "number"
        },
        {
          id: "barcodeBoxHeight",
          caption: "Barcode Box Height",
          value: 200,
          type: "number"
        },
        {
          id: "readDebounce",
          caption: "Read Debounce",
          value: 200,
          type: "number"
        },
        { id: "scanning", caption: "Scanning", value: true, type: "boolean" }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChBarcodeScannerElement>[] =
  [
    { name: "barcodeBoxWidth", defaultValue: 200, type: "number" },
    { name: "barcodeBoxHeight", defaultValue: 200, type: "number" },
    { name: "readDebounce", defaultValue: 200, type: "number" },
    { name: "scanning", defaultValue: true, type: "boolean" },
    {
      name: "read",
      fixed: true,
      value: "handleRead",
      type: "event"
    }
  ];

export const barcodeScannerShowcaseStory: ShowcaseStory<HTMLChBarcodeScannerElement> =
  {
    properties: showcaseRenderProperties,
    markupWithoutUIModel: {
      react: () => `<ChBarcodeScanner${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
      ></ChBarcodeScanner>`,

      stencil: () => `<ch-barcode-scanner${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}
        ></ch-barcode-scanner>`
    },
    render: render,
    state: state
  };
