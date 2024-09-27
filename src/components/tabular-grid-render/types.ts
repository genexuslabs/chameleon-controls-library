export type TabularGridModel = {
  columns: TabularGridColumnModel[];
  rowsets: TabularGridRowsetModel[];
};

export type TabularGridColumnModel = {
  name: string;
};

export type TabularGridRowsetModel = {
  legend?: TabularGridRowsetLegendModel;
  rows: TabularGridRowModel[];
  rowsets?: TabularGridRowsetModel[];
};

export type TabularGridRowsetLegendModel = {
  name: string;
};

export type TabularGridRowModel = {
  cells: TabularGridCellModel[];
  rows?: TabularGridRowModel[];
};

export type TabularGridCellModel = {
  text: string;
};
