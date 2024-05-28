import { FlexibleLayoutWidget } from "../../../../components/flexible-layout/internal/flexible-layout/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const simpleModel1: FlexibleLayoutWidget[] = [
  { id: "item1", name: "Item 1" },
  { id: "item2", name: "Item 2" },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "Item 4" }
];

export const simpleModel2: FlexibleLayoutWidget[] = [
  {
    id: "item1",
    name: "Item 1",
    startImgSrc: `${ASSETS_PREFIX}/angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    startImgSrc: `${ASSETS_PREFIX}/api.svg`
  },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}/dso.svg` }
];
