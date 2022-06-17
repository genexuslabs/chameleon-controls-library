export enum ChPaginatorNavigationType {
  FIRST = "first",
  PREVIOUS = "previous",
  NEXT = "next",
  LAST = "last",
}

export interface ChPaginatorNavigationClickedEvent {
  navigationType: ChPaginatorNavigationType;
}
