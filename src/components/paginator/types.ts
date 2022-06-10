export enum ChPaginatorButtonType {
  FIRST = "first",
  PREVIOUS = "previous",
  NEXT = "next",
  LAST = "last",
}

export interface ChPaginatorActivePageChangedEvent {
  page: number;
}
export interface ChPaginatorNavigationButtonClieckedEvent {
  buttonType: ChPaginatorButtonType;
}
