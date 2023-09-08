import { ChGridManager } from "./ch-grid-manager";

export class ChGridManagerRowActions {
  private readonly manager: ChGridManager;

  showOnRowHover: HTMLChGridRowActionsElement;
  showOnRowActions: HTMLChGridRowActionsElement;
  showOnRowContext: HTMLChGridRowActionsElement;

  constructor(manager: ChGridManager) {
    this.manager = manager;
    this.manager.grid
      .querySelectorAll("ch-grid-row-actions")
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
