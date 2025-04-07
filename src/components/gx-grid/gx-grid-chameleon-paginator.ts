import { GxGrid } from "./genexus";

export function paginationGoToFirstPage(grid: GxGrid) {
  if (grid.OnPaginationFirst) {
    grid.OnPaginationFirst();
  } else if (grid.usePaging) {
    grid.changeGridPage("FIRST");
  }
}

export function paginationGoToPreviousPage(grid: GxGrid) {
  if (grid.OnPaginationPrevious) {
    grid.OnPaginationPrevious();
  } else if (grid.usePaging) {
    grid.changeGridPage("PREV");
  }
}

export function paginationGoToNextPage(grid: GxGrid) {
  if (grid.OnPaginationNext) {
    grid.OnPaginationNext();
  } else if (grid.usePaging) {
    grid.changeGridPage("NEXT");
  }
}

export function paginationGoToLastPage(grid: GxGrid) {
  if (grid.OnPaginationLast) {
    grid.OnPaginationLast();
  } else if (grid.usePaging) {
    grid.changeGridPage("LAST");
  }
}

export function paginationGoToPage(grid: GxGrid, page: number) {
  if (page === 1) {
    grid.changeGridPage("FIRST");
  } else {
    grid.eof = 0;
    grid.firstRecordOnPage = (
      grid.pageSize * (page - 1) -
      grid.pageSize
    ).toString();
    grid.changeGridPage("NEXT");
  }
}
