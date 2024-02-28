import { fixAndUpdateLayoutModel } from "../utils";
import { ItemExtended, LayoutSplitterDistribution } from "../types";

describe("[ch-layout-splitter] [fixAndUpdateLayoutModel]", () => {
  const itemsInfo: Map<string, ItemExtended> = new Map();

  const model: LayoutSplitterDistribution = {
    id: "root",
    direction: "rows",
    items: [
      {
        id: "sub-group-1",
        size: "1fr",
        direction: "columns",
        items: [
          { id: "start-component", size: "100px", minSize: "200px" },
          { id: "center-component", size: "1fr", minSize: "250px" },
          { id: "end-component", size: "270px", minSize: "400px" }
        ]
      },
      { id: "end-end-component", size: "250px", minSize: "249px" },
      { id: "end-end-component-2", size: "250px", minSize: "251px" }
    ]
  };

  const resultModel: LayoutSplitterDistribution = {
    id: "root",
    direction: "rows",
    items: [
      {
        id: "sub-group-1",
        size: "1fr",
        direction: "columns",
        items: [
          { id: "start-component", size: "200px", minSize: "200px" },
          { id: "center-component", size: "1fr", minSize: "250px" },
          { id: "end-component", size: "400px", minSize: "400px" }
        ]
      },
      { id: "end-end-component", size: "250px", minSize: "249px" },
      { id: "end-end-component-2", size: "251px", minSize: "251px" }
    ]
  };

  it("updates px values that are lower to the minSize", async () => {
    const testModel = structuredClone(model);
    fixAndUpdateLayoutModel(testModel, itemsInfo);

    expect(JSON.stringify(testModel)).toEqual(JSON.stringify(resultModel));
  });

  it("the fixedSizesSum of the root is affected by the px values that are lower than minSize", async () => {
    const testModel = structuredClone(model);
    const fixedSizesSum = fixAndUpdateLayoutModel(testModel, itemsInfo);

    expect(fixedSizesSum).toEqual(501);
  });
});
