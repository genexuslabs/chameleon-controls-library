import { forceUpdate, h } from "@stencil/core";
import { ChBarcodeScanner } from "../../../../components/barcode-scanner/barcode-scanner";
import { ChBarcodeScannerCustomEvent } from "../../../../components";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<Mutable<ChBarcodeScanner>> = {};
let barcodeScannerRef: HTMLChBarcodeScannerElement;

let lastRead: string;

const handleRead = (event: ChBarcodeScannerCustomEvent<string>) => {
  lastRead = event.detail;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = barcodeScannerRef.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render = () => (
  <div class="barcode-scanner-test-main-wrapper">
    <ch-barcode-scanner
      barcodeBoxWidth={state.barcodeBoxWidth}
      barcodeBoxHeight={state.barcodeBoxHeight}
      scanning={state.scanning}
      onRead={handleRead}
      ref={el => (barcodeScannerRef = el)}
    ></ch-barcode-scanner>

    <span>Content: {lastRead}</span>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChBarcodeScanner>
> = [
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
      { id: "scanning", caption: "Scanning", value: true, type: "boolean" }
    ]
  }
];

export const barcodeScannerShowcaseStory: ShowcaseStory<
  Mutable<ChBarcodeScanner>
> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: () => `<ch-barcode-scanner
          barcodeBoxWidth={${state.barcodeBoxWidth}}
          barcodeBoxHeight={${
            state.barcodeBoxHeight
          }}${renderBooleanPropertyOrEmpty("scanning", state)}
          onRead={this.#handleRead}
        ></ch-barcode-scanner>`,
  render: render,
  state: state
};
