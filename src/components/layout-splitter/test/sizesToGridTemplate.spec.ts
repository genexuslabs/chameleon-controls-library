import {
  ItemExtended,
  LayoutSplitterDistribution,
  LayoutSplitterGroupModel
} from "../types";
import { fixAndUpdateLayoutModel, sizesToGridTemplate } from "../utils";

describe("[ch-layout-splitter] [sizesToGridTemplate]", () => {
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
          {
            id: "start-component-2",
            size: "100px",
            minSize: "200px",
            dragBar: { hidden: true }
          },
          { id: "center-component", size: "1fr", minSize: "250px" },
          { id: "end-component", size: "270px", minSize: "400px" },
          {
            id: "end-component-2",
            size: "4fr",
            minSize: "400px",
            dragBar: { size: 9 }
          },
          {
            id: "end-component-2",
            size: "3fr",
            dragBar: { size: 2, part: "visible" }
          }
        ]
      },
      { id: "end-end-component", size: "250px", minSize: "249px" },
      { id: "end-end-component-2", size: "250px", minSize: "251px" }
    ]
  };

  const itemsInfo: Map<string, ItemExtended> = new Map();

  fixAndUpdateLayoutModel(model, itemsInfo);

  it("should return the correct grid-template-columns", async () => {
    const templateResult = sizesToGridTemplate(model.items, itemsInfo, 2);

    expect(templateResult).toEqual(
      "calc(100% + var(--ch-layout-splitter-fixed-sizes-sum) * -1) 0px 250px 0px 251px"
    );
  });

  it("should return the correct grid-template-columns", async () => {
    const templateResult = sizesToGridTemplate(
      (model.items[0] as LayoutSplitterGroupModel).items,
      itemsInfo,
      5
    );

    expect(templateResult).toEqual(
      "200px 0px 200px minmax(250px,calc(12.5% + var(--ch-layout-splitter-fixed-sizes-sum) * -0.125)) 0px 400px 0px calc(37.5% + var(--ch-layout-splitter-fixed-sizes-sum) * -0.375) 9px calc(37.5% + var(--ch-layout-splitter-fixed-sizes-sum) * -0.375)"
    );
  });
});
