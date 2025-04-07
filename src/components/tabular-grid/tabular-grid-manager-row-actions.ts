import { TabularGridManager } from "./tabular-grid-manager";

export class TabularGridManagerRowActions {
  private readonly manager: TabularGridManager;

  showOnRowHover: HTMLChTabularGridRowActionsElement;
  showOnRowActions: HTMLChTabularGridRowActionsElement;
  showOnRowContext: HTMLChTabularGridRowActionsElement;

  constructor(manager: TabularGridManager) {
    this.manager = manager;
    this.manager.grid
      .querySelectorAll("ch-tabular-grid-row-actions")
      ?.forEach(rowActions => {
        if (rowActions.showOnRowHover) {
          this.showOnRowHover = rowActions;
        }
        if (rowActions.showOnRowActions) {
          this.showOnRowActions = rowActions;
        }
        if (rowActions.showOnRowContext) {
          this.showOnRowContext = rowActions;
        }
      });
  }
}
