// Models for Paginator Render UI
export type PaginatorRenderModel =
  | PaginatorRenderNumericModel
  | PaginatorRenderHyperlinkModel;

// Model without hyperlinks
export type PaginatorRenderNumericModel = {
  totalPages?: number;
  urlMapping?: (index: number) => string;
};

export type PaginatorControlsOrder = {
  itemsPerPage?: number;
  itemsPerPageInfo?: number;
  firstControl?: number;
  lastControl?: number;
  prevControl?: number;
  nextControl?: number;
  navigationControls?: number;
  navigationGoTo?: number;
  navigationControlsInfo?: number;
};

// Model with hyperlinks
export type PaginatorRenderHyperlinkModel = PaginatorRenderHyperlinkItemModel[];

export type PaginatorRenderHyperlinkItemModel = string;
