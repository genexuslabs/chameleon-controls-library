import { GxGrid } from "./gx-grid-chameleon";

export function gridRefresh(grid: GxGrid) {
  grid.ParentObject.refreshGrid(grid.ControlName);
}
