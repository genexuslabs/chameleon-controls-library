import { h } from "@stencil/core";
import { FlexibleLayoutRenders } from "../internal/flexible-layout/types";

export const TEST1_ID = "Test1";
export const TEST2_ID = "Test2";
export const TEST3_ID = "Test3";

export const flexibleLayoutTestRenders: FlexibleLayoutRenders = {
  [TEST3_ID]: () => (
    <button key={TEST3_ID} slot={TEST3_ID} type="button">
      Something
    </button>
  )
};
