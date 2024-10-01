export type TabularGridModel = {
  columns: TabularGridColumnModel[];
  rowsets: TabularGridRowsetModel[];
};

export type TabularGridColumnModel = {
  id: string;
  caption: string;
};

export type TabularGridRowsetModel = {
  legend?: TabularGridRowsetLegendModel;
  rows: TabularGridRowModel[];
  rowsets?: TabularGridRowsetModel[];
};

export type TabularGridRowsetLegendModel = {
  caption: string;
};

export type TabularGridRowModel = {
  cells: TabularGridCellModel[];
  rows?: TabularGridRowModel[];
};

export type TabularGridCellModel = {
  text: string;
};
