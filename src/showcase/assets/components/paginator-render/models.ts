import {
  ControlsOrder,
  PaginatorRenderHyperlinkItemModel,
  PaginatorRenderNumericModel
} from "./../../../../components/paginator-render/types";
import { ComboBoxModel } from "../../../../components/combo-box/types";

const mapping = (index: number) =>
  `http://localhost:3333/#paginator-render?page=${index}` as const;

export const paginatorRenderNumericModel: PaginatorRenderNumericModel = {
  totalPages: 30,
  urlMapping: mapping
};

export const PaginatorRenderNumericModelWithoutUrlMapping: PaginatorRenderNumericModel =
  { totalPages: 20 };

export const PaginatorRenderNumericModelWithoutTotalPages: PaginatorRenderNumericModel =
  { urlMapping: mapping };

export const PaginatorRenderHyperlinkModel: PaginatorRenderHyperlinkItemModel[] =
  [
    `http://localhost:3333/#paginator-render?page=1`,
    `http://localhost:3333/#paginator-render?page=2`,
    `http://localhost:3333/#paginator-render?page=3`,
    `http://localhost:3333/#paginator-render?page=4`,
    `http://localhost:3333/#paginator-render?page=5`,
    `http://localhost:3333/#paginator-render?page=6`,
    `http://localhost:3333/#paginator-render?page=7`,
    `http://localhost:3333/#paginator-render?page=8`,
    `http://localhost:3333/#paginator-render?page=9`,
    `http://localhost:3333/#paginator-render?page=10`
  ];

export const itemsPerPageOptionsModel: ComboBoxModel = [
  { value: "10", caption: "10" },
  { value: "20", caption: "20" },
  { value: "30", caption: "30" }
];

export const customOrder: ControlsOrder = {
  itemsPerPage: 4,
  itemsPerPageInfo: 1,
  navigationControls: 9,
  navigationGoTo: 2,
  navigationControlsInfo: 3,
  firstControl: 5,
  prevControl: 6,
  nextControl: 7,
  lastControl: 8
};
