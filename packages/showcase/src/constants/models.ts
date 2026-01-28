// import type { TabularGridModel } from "@genexus/chameleon-controls-library-lit";
import type { TabularGridModel } from "../../../chameleon/dist/browser/development";

export const tabularGridModel: TabularGridModel = {
  columns: [
    [
      { id: "A", caption: "Column A" },
      { id: "B", caption: "Column B" },
      { id: "C", caption: "Column C", colSpan: 2 },
      { id: "D", caption: "Column D", rowSpan: 2 }
    ],
    [
      { id: "Sub B", caption: "Column Sub B", colStart: 2 },
      { id: "Sub C.1", caption: "Column Sub C.1" },
      { id: "Sub C.2", caption: "Column Sub C.2" }
    ]
  ]
};
