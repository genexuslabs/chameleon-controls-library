import { h } from "@stencil/core";
import { FlexibleLayoutRenders } from "../internal/flexible-layout/types";

export const WIDGET1_ID = "Widget1";
export const WIDGET2_ID = "Widget2";
export const WIDGET3_ID = "Widget3";
export const WIDGET4_ID = "Widget4";

export const flexibleLayoutTestRenders: FlexibleLayoutRenders = {
  [WIDGET3_ID]: () => (
    <button key={WIDGET3_ID} slot={WIDGET3_ID} type="button">
      Something
    </button>
  ),
  [WIDGET4_ID]: () => (
    <span key={WIDGET4_ID} slot={WIDGET4_ID}>
      Something within the span
    </span>
  )
};
