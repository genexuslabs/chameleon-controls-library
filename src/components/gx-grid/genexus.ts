import { GridChameleonColumnFilterEnum } from "./gx-grid-column-filter/gx-grid-chameleon-column-filter";

export interface Gx {
    fx: {
      obs: {
        notify(eventName: string): void;
      };
    };
    fn: {
      currentGridRowImpl(gxId: number): string;
      setCurrentGridRow(gxId: number, rowGxId: string): void;
    };
    lang: {
      gxBoolean(value: undefined | boolean | number | string): boolean;
    };
    popup: {
      ispopup(): boolean;
    };
    date: {
      ctod(value: string, format?: "Y4MD"): gxdate;
      ctot(value: string, format?: "Y4MD"): gxdate;
      isNullDate(date: Date | gxdate): boolean;
    };
    getMessage(id: string): string;
  }

  export interface gxdate {
    toString(): string;
    toISOString(): string;
    Value: Date;
  }
  
  export interface GxGrid {
    readonly gxId: number;
    readonly ControlName: string;
    readonly columns: GxGridColumn[];
    readonly rows: GxGridRow[];
    readonly usePaging: boolean;
    readonly pageSize: number;
    readonly properties: GxGridCellProperties[][];
    readonly ParentObject: GxObject;
    readonly header: string;
    readonly Class: string;
    readonly gxAllowSelection: boolean;
    readonly gxAllowHovering: boolean;
    readonly pagingBarClass: string;
    readonly pagingButtonFirstClass: string;
    readonly pagingButtonLastClass: string;
    readonly pagingButtonNextClass: string;
    readonly pagingButtonPreviousClass: string;
  
    getRowByGxId(gxId: string): GxGridRow;
    setSort(columnIndex: number, asc?: boolean): void;
    selectRow(index: number): void;
    execC2VFunctions(): void;
    executeEvent(columnIndex: number, rowIndex: number): void;
    changeGridPage(direction: string, force?: boolean): any;
    isFirstPage(): boolean;
    isLastPage(): boolean;
    getColumnByHtmlName(htmlName: string): GxGridColumn;
  
    // UserControl
    readonly SortMode: "client" | "server";
  
    readonly ColumnsetClass: string;
    readonly ColumnClass: string;
    readonly ColumnFilterClass: string;
    readonly RowClass: string;
    readonly RowEvenClass: string;
    readonly RowOddClass: string;
    readonly RowSelectedClass: string;
    readonly RowHighlightedClass: string;
    readonly CellClass: string;
  
    readonly FilterButtonApplyText: string;
    readonly FilterButtonResetText: string;

    readonly PaginatorShow: boolean;
    readonly PaginatorNavigationButtonTextPosition: "title" | "text";
  
    readonly ActionbarHeaderClass: string;
    readonly ActionbarFooterClass: string;
  
    readonly ActionRefreshPosition: "none" | "header" | "footer";
    readonly ActionRefreshTextPosition: "title" | "text";
    readonly ActionRefreshClass: string;
  
    readonly ActionSettingsPosition: "none" | "header" | "footer";
    readonly ActionSettingsTextPosition: "title" | "text";
    readonly ActionSettingsClass: string;
  
    readonly SettingsCloseTextPosition: "title" | "text";
  
    OnPaginationFirst(): void;
    OnPaginationPrevious(): void;
    OnPaginationNext(): void;
    OnPaginationLast(): void;
  }
  
  export interface GxGridColumn {
    readonly title: string;
    readonly visible: boolean;
    readonly gxColumnClass: string;
    readonly gxControl: GxControl;
    readonly gxAttId: string;
    readonly gxAttName: string;
    readonly htmlName: string;
    readonly index: number;
  
    // UserControl
    readonly Icon: string;
    readonly NamePosition: "title" | "text";
    readonly HeaderClass: string;
    Hidden: number;
    readonly Hideable: number;
    readonly Sortable: number;
    readonly Filterable: number;
    readonly Resizeable: number;
    Size: "min" | "max" | "minmax" | "auto" | "length" | "css";
    SizeLength: string;
    SizeMinLength: string;
    SizeMaxLength: string;
    SizeVariableName: string;
    readonly FilterMode: "single" | "range";
    readonly FilterEnum: GridChameleonColumnFilterEnum[],
    readonly FilterDateTimeAsDate: number,
    readonly FilterCaption: string,
    readonly FilterLabelEqual: string,
    readonly FilterLabelLess: string,
    readonly FilterLabelGreater: string,
    SortDirection: "asc" | "desc";
  
    filterEqual: string;
    filterLess: string;
    filterGreater: string;
    isFiltering: boolean;

    render: boolean;
  }
  
  export interface GxGridRow {
    readonly id: number;
    readonly gxId: string;
    readonly values: string[];
    readonly gxProps: any[];
  }
  
  export interface GxGridCellProperties {
    column: GxGridColumn;
    visible: boolean;
  }
  
  export interface GxControl {
    setProperties(): void;
    getHtml(): string;
  
    dataType: GxControlDataType;
    type: GxControlType;
    possibleValues: GxControlPossibleValues;
  }
  
  export type GxControlPossibleValues = [string, string][];
  
  export interface GxObject {
    refreshGrid(gridName: string): void;
  }
  
  export enum GxControlType {
    EDIT = 1,
    RADIO = 4,
    COMBO = 5,
    CHECK = 7,
  }
  
  export enum GxControlDataType {
    NUMBER = 0,
    CHAR = 1,
    DATE = 2,
    DATETIME = 3,
    VARCHAR = 5,
    LONGVARCHAR = 6,
    BOOLEAN = 7,
  }
  