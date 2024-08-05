import { TabModel } from "../../../../components/tab/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const simpleModel1: TabModel = [
  { id: "item1", name: "Item 1" },
  { id: "item2", name: "Item 2" },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "Item 4" }
];

export const simpleModel2: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}dso.svg` }
];

export const disabledModel1: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3", disabled: true },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}dso.svg` }
];

export const disabledModel2: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3" },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];

export const disabledModel3: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3  (not disabled)", disabled: false },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];

export const disabledModel4: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3", disabled: true },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];
