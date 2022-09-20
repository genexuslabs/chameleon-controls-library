/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { GridLocalization } from "./components/grid/ch-grid";
import { ChGridCellClickedEvent, ChGridSelectionChangedEvent } from "./components/grid/types";
import { ChGridColumnDragEvent, ChGridColumnHiddenChangedEvent, ChGridColumnOrderChangedEvent, ChGridColumnSizeChangedEvent, ChGridColumnSortChangedEvent, ColumnSortDirection } from "./components/grid-column/ch-grid-column-types";
import { ChGridColumn } from "./components/grid-column/ch-grid-column";
import { ChGridManager } from "./components/grid/ch-grid-manager";
import { Color, Size } from "./components/icon/icon";
import { ChPaginatorActivePageChangedEvent } from "./components/paginator/ch-paginator";
import { ChPaginatorNavigationClickedEvent, ChPaginatorNavigationType } from "./components/paginator-navigate/ch-paginator-navigate-types";
import { ecLevel } from "./components/qr/ch-qr";
import { GxGrid } from "./components/gx-grid/gx-grid-chameleon";
import { GridChameleonState } from "./components/gx-grid/gx-grid-chameleon-state";
export namespace Components {
    interface ChFormCheckbox {
        /**
          * The checkbox id
         */
        "checkboxId": string;
        /**
          * The presence of this attribute makes the checkbox checked by default
         */
        "checked": boolean;
        /**
          * The presence of this attribute disables the checkbox
         */
        "disabled": boolean;
        /**
          * The presence of this attribute makes the checkbox indeterminate
         */
        "indeterminate": boolean;
        /**
          * The checkbox label
         */
        "label": string;
        /**
          * The checkbox name
         */
        "name": string;
        /**
          * The checkbox value
         */
        "value": string;
    }
    interface ChGrid {
        "localization": GridLocalization;
        "onRowHighlightedClass": string;
        "onRowSelectedClass": string;
        "rowSelectionMode": "none" | "single" | "multiple";
    }
    interface ChGridActionRefresh {
        "disabled": boolean;
    }
    interface ChGridActionSettings {
        "disabled": boolean;
    }
    interface ChGridActionbar {
    }
    interface ChGridColumn {
        "columnIconUrl": string;
        "columnId": string;
        "columnName": string;
        "columnNamePosition": "title" | "text";
        "displayObserverClass": string;
        "hidden": boolean;
        "hideable": boolean;
        "order": number;
        "physicalOrder": number;
        "resizeable": boolean;
        "resizing": boolean;
        "settingable": boolean;
        "showSettings": boolean;
        "size": string;
        "sortDirection"?: ColumnSortDirection;
        "sortable": boolean;
    }
    interface ChGridColumnDisplay {
        "column": HTMLChGridColumnElement;
    }
    interface ChGridColumnResize {
        "column": ChGridColumn;
    }
    interface ChGridColumnSettings {
        "column": ChGridColumn;
        "show": boolean;
    }
    interface ChGridColumnset {
    }
    interface ChGridRowset {
    }
    interface ChGridRowsetLegend {
    }
    interface ChGridSettings {
        "gridManager": ChGridManager;
        "show": boolean;
    }
    interface ChGridSettingsColumns {
        "columns": HTMLChGridColumnElement[];
    }
    interface ChIcon {
        /**
          * If enabled, the icon will display its inherent/natural color
         */
        "autoColor": boolean;
        /**
          * The color of the icon.
         */
        "color": Color;
        /**
          * If enabled, the icon will be loaded lazily when it's visible in the viewport.
         */
        "lazy": boolean;
        /**
          * The size of the icon. Possible values: regular, small.
         */
        "size": Size;
        /**
          * The URL of the icon.
         */
        "src": string;
    }
    interface ChPaginator {
        "activePage": number;
        "totalPages": number;
    }
    interface ChPaginatorNavigate {
        "disabled": boolean;
        "type": ChPaginatorNavigationType;
    }
    interface ChPaginatorPages {
        "activePage": number;
        "maxSize": number;
        "renderFirstLastPages": true;
        "textDots": string;
        "totalPages": number;
    }
    interface ChQr {
        "background": string | null;
        "ecLevel": ecLevel;
        "fill": string;
        "radius": number;
        "size": number;
        "text": string | undefined;
    }
    interface ChSelect {
        "arrowIconSrc": string;
        /**
          * If enabled, the icon will display its inherent/natural color
         */
        "autoColor": boolean;
        "height": string;
        "iconSrc": string;
        "name": string;
        "optionHeight": string;
        "width": string;
    }
    interface ChSidebarMenu {
        /**
          * The active item
         */
        "activeItem": string;
        /**
          * The initial active item (optional)
         */
        "activeItemId": string;
        /**
          * Determines if the menu can be collapsed
         */
        "collapsible": boolean;
        /**
          * Allows to set the distance to the top of the page on the menu
         */
        "distanceToTop": number;
        /**
          * Determines if the menu is collapsed
         */
        "isCollapsed": boolean;
        /**
          * The menu title
         */
        "menuTitle": string;
        /**
          * The presence of this attribute allows the menu to have only one list opened at the same time
         */
        "singleListOpen": boolean;
    }
    interface ChSidebarMenuList {
    }
    interface ChSidebarMenuListItem {
        /**
          * The first list item icon (optional)
         */
        "itemIconSrc": string;
        /**
          * If this attribute is present the item will be initially uncollapsed
         */
        "uncollapsed": boolean;
    }
    interface ChStepList {
    }
    interface ChStepListItem {
        /**
          * Set the left side icon
         */
        "iconSrc": string;
    }
    interface ChTree {
        /**
          * Set this attribute if you want all this tree tree-items to have a checkbox
         */
        "checkbox": boolean;
        /**
          * Set this attribute if you want all this tree tree-items to have the checkbox checked
         */
        "checked": boolean;
        /**
          * Allows to select only one item
         */
        "singleSelection": boolean;
        /**
          * Set this attribute if you want all the childen item's checkboxes to be checked when the parent item checkbox is checked, or to be unchecked when the parent item checkbox is unckecked.
         */
        "toggleCheckboxes": boolean;
    }
    interface ChTreeItem {
        /**
          * Set this attribute if you want the ch-tree-item to display a checkbox
         */
        "checkbox": boolean;
        /**
          * Set this attribute if you want the ch-tree-item checkbox to be checked by default
         */
        "checked": boolean;
        "disabled": boolean;
        /**
          * Set this attribute if this tree-item has a resource to be downloaded;
         */
        "download": boolean;
        /**
          * Set this attribute when you have downloaded the resource
         */
        "downloaded": boolean;
        /**
          * Set this attribute when you are downloading a resource
         */
        "downloading": boolean;
        "firstTreeItem": boolean;
        "hasChildTree": boolean;
        "indeterminate": boolean;
        /**
          * The presence of this attribute displays a +/- icon to toggle/untoggle the tree
         */
        "isLeaf": boolean;
        /**
          * Set the left side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
         */
        "leftIcon": string;
        /**
          * If this tree-item has a nested tree, set this attribute to make the tree open by default
         */
        "opened": boolean;
        /**
          * Set thhe right side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
         */
        "rightIcon": string;
        /**
          * The presence of this attribute sets the tree-item as selected
         */
        "selected": boolean;
        "updateTreeVerticalLineHeight": () => Promise<void>;
    }
    interface ChWindow {
        "caption": string;
        "closeAuto": boolean;
        "closeText": string;
        "closeTooltip": string;
        "hidden": boolean;
        "modal": boolean;
    }
    interface GxGridChameleon {
        "grid": GxGrid;
        "gridTimestamp": number;
        "state": GridChameleonState;
    }
}
declare global {
    interface HTMLChFormCheckboxElement extends Components.ChFormCheckbox, HTMLStencilElement {
    }
    var HTMLChFormCheckboxElement: {
        prototype: HTMLChFormCheckboxElement;
        new (): HTMLChFormCheckboxElement;
    };
    interface HTMLChGridElement extends Components.ChGrid, HTMLStencilElement {
    }
    var HTMLChGridElement: {
        prototype: HTMLChGridElement;
        new (): HTMLChGridElement;
    };
    interface HTMLChGridActionRefreshElement extends Components.ChGridActionRefresh, HTMLStencilElement {
    }
    var HTMLChGridActionRefreshElement: {
        prototype: HTMLChGridActionRefreshElement;
        new (): HTMLChGridActionRefreshElement;
    };
    interface HTMLChGridActionSettingsElement extends Components.ChGridActionSettings, HTMLStencilElement {
    }
    var HTMLChGridActionSettingsElement: {
        prototype: HTMLChGridActionSettingsElement;
        new (): HTMLChGridActionSettingsElement;
    };
    interface HTMLChGridActionbarElement extends Components.ChGridActionbar, HTMLStencilElement {
    }
    var HTMLChGridActionbarElement: {
        prototype: HTMLChGridActionbarElement;
        new (): HTMLChGridActionbarElement;
    };
    interface HTMLChGridColumnElement extends Components.ChGridColumn, HTMLStencilElement {
    }
    var HTMLChGridColumnElement: {
        prototype: HTMLChGridColumnElement;
        new (): HTMLChGridColumnElement;
    };
    interface HTMLChGridColumnDisplayElement extends Components.ChGridColumnDisplay, HTMLStencilElement {
    }
    var HTMLChGridColumnDisplayElement: {
        prototype: HTMLChGridColumnDisplayElement;
        new (): HTMLChGridColumnDisplayElement;
    };
    interface HTMLChGridColumnResizeElement extends Components.ChGridColumnResize, HTMLStencilElement {
    }
    var HTMLChGridColumnResizeElement: {
        prototype: HTMLChGridColumnResizeElement;
        new (): HTMLChGridColumnResizeElement;
    };
    interface HTMLChGridColumnSettingsElement extends Components.ChGridColumnSettings, HTMLStencilElement {
    }
    var HTMLChGridColumnSettingsElement: {
        prototype: HTMLChGridColumnSettingsElement;
        new (): HTMLChGridColumnSettingsElement;
    };
    interface HTMLChGridColumnsetElement extends Components.ChGridColumnset, HTMLStencilElement {
    }
    var HTMLChGridColumnsetElement: {
        prototype: HTMLChGridColumnsetElement;
        new (): HTMLChGridColumnsetElement;
    };
    interface HTMLChGridRowsetElement extends Components.ChGridRowset, HTMLStencilElement {
    }
    var HTMLChGridRowsetElement: {
        prototype: HTMLChGridRowsetElement;
        new (): HTMLChGridRowsetElement;
    };
    interface HTMLChGridRowsetLegendElement extends Components.ChGridRowsetLegend, HTMLStencilElement {
    }
    var HTMLChGridRowsetLegendElement: {
        prototype: HTMLChGridRowsetLegendElement;
        new (): HTMLChGridRowsetLegendElement;
    };
    interface HTMLChGridSettingsElement extends Components.ChGridSettings, HTMLStencilElement {
    }
    var HTMLChGridSettingsElement: {
        prototype: HTMLChGridSettingsElement;
        new (): HTMLChGridSettingsElement;
    };
    interface HTMLChGridSettingsColumnsElement extends Components.ChGridSettingsColumns, HTMLStencilElement {
    }
    var HTMLChGridSettingsColumnsElement: {
        prototype: HTMLChGridSettingsColumnsElement;
        new (): HTMLChGridSettingsColumnsElement;
    };
    interface HTMLChIconElement extends Components.ChIcon, HTMLStencilElement {
    }
    var HTMLChIconElement: {
        prototype: HTMLChIconElement;
        new (): HTMLChIconElement;
    };
    interface HTMLChPaginatorElement extends Components.ChPaginator, HTMLStencilElement {
    }
    var HTMLChPaginatorElement: {
        prototype: HTMLChPaginatorElement;
        new (): HTMLChPaginatorElement;
    };
    interface HTMLChPaginatorNavigateElement extends Components.ChPaginatorNavigate, HTMLStencilElement {
    }
    var HTMLChPaginatorNavigateElement: {
        prototype: HTMLChPaginatorNavigateElement;
        new (): HTMLChPaginatorNavigateElement;
    };
    interface HTMLChPaginatorPagesElement extends Components.ChPaginatorPages, HTMLStencilElement {
    }
    var HTMLChPaginatorPagesElement: {
        prototype: HTMLChPaginatorPagesElement;
        new (): HTMLChPaginatorPagesElement;
    };
    interface HTMLChQrElement extends Components.ChQr, HTMLStencilElement {
    }
    var HTMLChQrElement: {
        prototype: HTMLChQrElement;
        new (): HTMLChQrElement;
    };
    interface HTMLChSelectElement extends Components.ChSelect, HTMLStencilElement {
    }
    var HTMLChSelectElement: {
        prototype: HTMLChSelectElement;
        new (): HTMLChSelectElement;
    };
    interface HTMLChSidebarMenuElement extends Components.ChSidebarMenu, HTMLStencilElement {
    }
    var HTMLChSidebarMenuElement: {
        prototype: HTMLChSidebarMenuElement;
        new (): HTMLChSidebarMenuElement;
    };
    interface HTMLChSidebarMenuListElement extends Components.ChSidebarMenuList, HTMLStencilElement {
    }
    var HTMLChSidebarMenuListElement: {
        prototype: HTMLChSidebarMenuListElement;
        new (): HTMLChSidebarMenuListElement;
    };
    interface HTMLChSidebarMenuListItemElement extends Components.ChSidebarMenuListItem, HTMLStencilElement {
    }
    var HTMLChSidebarMenuListItemElement: {
        prototype: HTMLChSidebarMenuListItemElement;
        new (): HTMLChSidebarMenuListItemElement;
    };
    interface HTMLChStepListElement extends Components.ChStepList, HTMLStencilElement {
    }
    var HTMLChStepListElement: {
        prototype: HTMLChStepListElement;
        new (): HTMLChStepListElement;
    };
    interface HTMLChStepListItemElement extends Components.ChStepListItem, HTMLStencilElement {
    }
    var HTMLChStepListItemElement: {
        prototype: HTMLChStepListItemElement;
        new (): HTMLChStepListItemElement;
    };
    interface HTMLChTreeElement extends Components.ChTree, HTMLStencilElement {
    }
    var HTMLChTreeElement: {
        prototype: HTMLChTreeElement;
        new (): HTMLChTreeElement;
    };
    interface HTMLChTreeItemElement extends Components.ChTreeItem, HTMLStencilElement {
    }
    var HTMLChTreeItemElement: {
        prototype: HTMLChTreeItemElement;
        new (): HTMLChTreeItemElement;
    };
    interface HTMLChWindowElement extends Components.ChWindow, HTMLStencilElement {
    }
    var HTMLChWindowElement: {
        prototype: HTMLChWindowElement;
        new (): HTMLChWindowElement;
    };
    interface HTMLGxGridChameleonElement extends Components.GxGridChameleon, HTMLStencilElement {
    }
    var HTMLGxGridChameleonElement: {
        prototype: HTMLGxGridChameleonElement;
        new (): HTMLGxGridChameleonElement;
    };
    interface HTMLElementTagNameMap {
        "ch-form-checkbox": HTMLChFormCheckboxElement;
        "ch-grid": HTMLChGridElement;
        "ch-grid-action-refresh": HTMLChGridActionRefreshElement;
        "ch-grid-action-settings": HTMLChGridActionSettingsElement;
        "ch-grid-actionbar": HTMLChGridActionbarElement;
        "ch-grid-column": HTMLChGridColumnElement;
        "ch-grid-column-display": HTMLChGridColumnDisplayElement;
        "ch-grid-column-resize": HTMLChGridColumnResizeElement;
        "ch-grid-column-settings": HTMLChGridColumnSettingsElement;
        "ch-grid-columnset": HTMLChGridColumnsetElement;
        "ch-grid-rowset": HTMLChGridRowsetElement;
        "ch-grid-rowset-legend": HTMLChGridRowsetLegendElement;
        "ch-grid-settings": HTMLChGridSettingsElement;
        "ch-grid-settings-columns": HTMLChGridSettingsColumnsElement;
        "ch-icon": HTMLChIconElement;
        "ch-paginator": HTMLChPaginatorElement;
        "ch-paginator-navigate": HTMLChPaginatorNavigateElement;
        "ch-paginator-pages": HTMLChPaginatorPagesElement;
        "ch-qr": HTMLChQrElement;
        "ch-select": HTMLChSelectElement;
        "ch-sidebar-menu": HTMLChSidebarMenuElement;
        "ch-sidebar-menu-list": HTMLChSidebarMenuListElement;
        "ch-sidebar-menu-list-item": HTMLChSidebarMenuListItemElement;
        "ch-step-list": HTMLChStepListElement;
        "ch-step-list-item": HTMLChStepListItemElement;
        "ch-tree": HTMLChTreeElement;
        "ch-tree-item": HTMLChTreeItemElement;
        "ch-window": HTMLChWindowElement;
        "gx-grid-chameleon": HTMLGxGridChameleonElement;
    }
}
declare namespace LocalJSX {
    interface ChFormCheckbox {
        /**
          * The checkbox id
         */
        "checkboxId"?: string;
        /**
          * The presence of this attribute makes the checkbox checked by default
         */
        "checked"?: boolean;
        /**
          * The presence of this attribute disables the checkbox
         */
        "disabled"?: boolean;
        /**
          * The presence of this attribute makes the checkbox indeterminate
         */
        "indeterminate"?: boolean;
        /**
          * The checkbox label
         */
        "label"?: string;
        /**
          * The checkbox name
         */
        "name"?: string;
        "onChange"?: (event: CustomEvent<any>) => void;
        /**
          * The checkbox value
         */
        "value"?: string;
    }
    interface ChGrid {
        "localization"?: GridLocalization;
        "onCellClicked"?: (event: CustomEvent<ChGridCellClickedEvent>) => void;
        "onRowHighlightedClass"?: string;
        "onRowSelectedClass"?: string;
        "onSelectionChanged"?: (event: CustomEvent<ChGridSelectionChangedEvent>) => void;
        "rowSelectionMode"?: "none" | "single" | "multiple";
    }
    interface ChGridActionRefresh {
        "disabled"?: boolean;
        "onRefreshClicked"?: (event: CustomEvent<any>) => void;
    }
    interface ChGridActionSettings {
        "disabled"?: boolean;
        "onSettingsShowClicked"?: (event: CustomEvent<any>) => void;
    }
    interface ChGridActionbar {
    }
    interface ChGridColumn {
        "columnIconUrl"?: string;
        "columnId"?: string;
        "columnName"?: string;
        "columnNamePosition"?: "title" | "text";
        "displayObserverClass"?: string;
        "hidden"?: boolean;
        "hideable"?: boolean;
        "onColumnDragEnded"?: (event: CustomEvent<ChGridColumnDragEvent>) => void;
        "onColumnDragStarted"?: (event: CustomEvent<ChGridColumnDragEvent>) => void;
        "onColumnDragging"?: (event: CustomEvent<ChGridColumnDragEvent>) => void;
        "onColumnHiddenChanged"?: (event: CustomEvent<ChGridColumnHiddenChangedEvent>) => void;
        "onColumnOrderChanged"?: (event: CustomEvent<ChGridColumnOrderChangedEvent>) => void;
        "onColumnSizeChanged"?: (event: CustomEvent<ChGridColumnSizeChangedEvent>) => void;
        "onColumnSizeChanging"?: (event: CustomEvent<ChGridColumnSizeChangedEvent>) => void;
        "onColumnSortChanged"?: (event: CustomEvent<ChGridColumnSortChangedEvent>) => void;
        "order"?: number;
        "physicalOrder"?: number;
        "resizeable"?: boolean;
        "resizing"?: boolean;
        "settingable"?: boolean;
        "showSettings"?: boolean;
        "size"?: string;
        "sortDirection"?: ColumnSortDirection;
        "sortable"?: boolean;
    }
    interface ChGridColumnDisplay {
        "column"?: HTMLChGridColumnElement;
    }
    interface ChGridColumnResize {
        "column"?: ChGridColumn;
        "onColumnResizeFinished"?: (event: CustomEvent<any>) => void;
        "onColumnResizeStarted"?: (event: CustomEvent<any>) => void;
    }
    interface ChGridColumnSettings {
        "column"?: ChGridColumn;
        "onSettingsCloseClicked"?: (event: CustomEvent<any>) => void;
        "show"?: boolean;
    }
    interface ChGridColumnset {
    }
    interface ChGridRowset {
    }
    interface ChGridRowsetLegend {
    }
    interface ChGridSettings {
        "gridManager"?: ChGridManager;
        "onSettingsCloseClicked"?: (event: CustomEvent<any>) => void;
        "show"?: boolean;
    }
    interface ChGridSettingsColumns {
        "columns"?: HTMLChGridColumnElement[];
    }
    interface ChIcon {
        /**
          * If enabled, the icon will display its inherent/natural color
         */
        "autoColor"?: boolean;
        /**
          * The color of the icon.
         */
        "color"?: Color;
        /**
          * If enabled, the icon will be loaded lazily when it's visible in the viewport.
         */
        "lazy"?: boolean;
        /**
          * The size of the icon. Possible values: regular, small.
         */
        "size"?: Size;
        /**
          * The URL of the icon.
         */
        "src"?: string;
    }
    interface ChPaginator {
        "activePage"?: number;
        "onActivePageChanged"?: (event: CustomEvent<ChPaginatorActivePageChangedEvent>) => void;
        "totalPages"?: number;
    }
    interface ChPaginatorNavigate {
        "disabled"?: boolean;
        "onNavigationClicked"?: (event: CustomEvent<ChPaginatorNavigationClickedEvent>) => void;
        "type"?: ChPaginatorNavigationType;
    }
    interface ChPaginatorPages {
        "activePage"?: number;
        "maxSize"?: number;
        "onPageClicked"?: (event: CustomEvent<any>) => void;
        "renderFirstLastPages"?: true;
        "textDots"?: string;
        "totalPages"?: number;
    }
    interface ChQr {
        "background"?: string | null;
        "ecLevel"?: ecLevel;
        "fill"?: string;
        "radius"?: number;
        "size"?: number;
        "text"?: string | undefined;
    }
    interface ChSelect {
        "arrowIconSrc"?: string;
        /**
          * If enabled, the icon will display its inherent/natural color
         */
        "autoColor"?: boolean;
        "height"?: string;
        "iconSrc"?: string;
        "name"?: string;
        /**
          * @type EventEmitter * Track component events (I.e. activation of dropdown component)
         */
        "onOnToggle"?: (event: CustomEvent<any>) => void;
        /**
          * Emmits the item id
         */
        "onOptionClickedEvent"?: (event: CustomEvent<any>) => void;
        "optionHeight"?: string;
        "width"?: string;
    }
    interface ChSidebarMenu {
        /**
          * The active item
         */
        "activeItem"?: string;
        /**
          * The initial active item (optional)
         */
        "activeItemId"?: string;
        /**
          * Determines if the menu can be collapsed
         */
        "collapsible"?: boolean;
        /**
          * Allows to set the distance to the top of the page on the menu
         */
        "distanceToTop"?: number;
        /**
          * Determines if the menu is collapsed
         */
        "isCollapsed"?: boolean;
        /**
          * The menu title
         */
        "menuTitle"?: string;
        "onCollapseBtnClicked"?: (event: CustomEvent<any>) => void;
        "onItemClicked"?: (event: CustomEvent<any>) => void;
        /**
          * The presence of this attribute allows the menu to have only one list opened at the same time
         */
        "singleListOpen"?: boolean;
    }
    interface ChSidebarMenuList {
    }
    interface ChSidebarMenuListItem {
        /**
          * The first list item icon (optional)
         */
        "itemIconSrc"?: string;
        /**
          * Emmits the item id
         */
        "onItemClickedEvent"?: (event: CustomEvent<any>) => void;
        /**
          * If this attribute is present the item will be initially uncollapsed
         */
        "uncollapsed"?: boolean;
    }
    interface ChStepList {
    }
    interface ChStepListItem {
        /**
          * Set the left side icon
         */
        "iconSrc"?: string;
        /**
          * Emits the item id
         */
        "onItemClicked"?: (event: CustomEvent<any>) => void;
    }
    interface ChTree {
        /**
          * Set this attribute if you want all this tree tree-items to have a checkbox
         */
        "checkbox"?: boolean;
        /**
          * Set this attribute if you want all this tree tree-items to have the checkbox checked
         */
        "checked"?: boolean;
        /**
          * Allows to select only one item
         */
        "singleSelection"?: boolean;
        /**
          * Set this attribute if you want all the childen item's checkboxes to be checked when the parent item checkbox is checked, or to be unchecked when the parent item checkbox is unckecked.
         */
        "toggleCheckboxes"?: boolean;
    }
    interface ChTreeItem {
        /**
          * Set this attribute if you want the ch-tree-item to display a checkbox
         */
        "checkbox"?: boolean;
        /**
          * Set this attribute if you want the ch-tree-item checkbox to be checked by default
         */
        "checked"?: boolean;
        "disabled"?: boolean;
        /**
          * Set this attribute if this tree-item has a resource to be downloaded;
         */
        "download"?: boolean;
        /**
          * Set this attribute when you have downloaded the resource
         */
        "downloaded"?: boolean;
        /**
          * Set this attribute when you are downloading a resource
         */
        "downloading"?: boolean;
        "firstTreeItem"?: boolean;
        "hasChildTree"?: boolean;
        "indeterminate"?: boolean;
        /**
          * The presence of this attribute displays a +/- icon to toggle/untoggle the tree
         */
        "isLeaf"?: boolean;
        /**
          * Set the left side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
         */
        "leftIcon"?: string;
        "onCheckboxClickedEvent"?: (event: CustomEvent<any>) => void;
        "onLiItemClicked"?: (event: CustomEvent<any>) => void;
        "onToggleIconClicked"?: (event: CustomEvent<any>) => void;
        /**
          * If this tree-item has a nested tree, set this attribute to make the tree open by default
         */
        "opened"?: boolean;
        /**
          * Set thhe right side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
         */
        "rightIcon"?: string;
        /**
          * The presence of this attribute sets the tree-item as selected
         */
        "selected"?: boolean;
    }
    interface ChWindow {
        "caption"?: string;
        "closeAuto"?: boolean;
        "closeText"?: string;
        "closeTooltip"?: string;
        "hidden"?: boolean;
        "modal"?: boolean;
        "onWindowClosed"?: (event: CustomEvent<any>) => void;
    }
    interface GxGridChameleon {
        "grid"?: GxGrid;
        "gridTimestamp"?: number;
        "state"?: GridChameleonState;
    }
    interface IntrinsicElements {
        "ch-form-checkbox": ChFormCheckbox;
        "ch-grid": ChGrid;
        "ch-grid-action-refresh": ChGridActionRefresh;
        "ch-grid-action-settings": ChGridActionSettings;
        "ch-grid-actionbar": ChGridActionbar;
        "ch-grid-column": ChGridColumn;
        "ch-grid-column-display": ChGridColumnDisplay;
        "ch-grid-column-resize": ChGridColumnResize;
        "ch-grid-column-settings": ChGridColumnSettings;
        "ch-grid-columnset": ChGridColumnset;
        "ch-grid-rowset": ChGridRowset;
        "ch-grid-rowset-legend": ChGridRowsetLegend;
        "ch-grid-settings": ChGridSettings;
        "ch-grid-settings-columns": ChGridSettingsColumns;
        "ch-icon": ChIcon;
        "ch-paginator": ChPaginator;
        "ch-paginator-navigate": ChPaginatorNavigate;
        "ch-paginator-pages": ChPaginatorPages;
        "ch-qr": ChQr;
        "ch-select": ChSelect;
        "ch-sidebar-menu": ChSidebarMenu;
        "ch-sidebar-menu-list": ChSidebarMenuList;
        "ch-sidebar-menu-list-item": ChSidebarMenuListItem;
        "ch-step-list": ChStepList;
        "ch-step-list-item": ChStepListItem;
        "ch-tree": ChTree;
        "ch-tree-item": ChTreeItem;
        "ch-window": ChWindow;
        "gx-grid-chameleon": GxGridChameleon;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "ch-form-checkbox": LocalJSX.ChFormCheckbox & JSXBase.HTMLAttributes<HTMLChFormCheckboxElement>;
            "ch-grid": LocalJSX.ChGrid & JSXBase.HTMLAttributes<HTMLChGridElement>;
            "ch-grid-action-refresh": LocalJSX.ChGridActionRefresh & JSXBase.HTMLAttributes<HTMLChGridActionRefreshElement>;
            "ch-grid-action-settings": LocalJSX.ChGridActionSettings & JSXBase.HTMLAttributes<HTMLChGridActionSettingsElement>;
            "ch-grid-actionbar": LocalJSX.ChGridActionbar & JSXBase.HTMLAttributes<HTMLChGridActionbarElement>;
            "ch-grid-column": LocalJSX.ChGridColumn & JSXBase.HTMLAttributes<HTMLChGridColumnElement>;
            "ch-grid-column-display": LocalJSX.ChGridColumnDisplay & JSXBase.HTMLAttributes<HTMLChGridColumnDisplayElement>;
            "ch-grid-column-resize": LocalJSX.ChGridColumnResize & JSXBase.HTMLAttributes<HTMLChGridColumnResizeElement>;
            "ch-grid-column-settings": LocalJSX.ChGridColumnSettings & JSXBase.HTMLAttributes<HTMLChGridColumnSettingsElement>;
            "ch-grid-columnset": LocalJSX.ChGridColumnset & JSXBase.HTMLAttributes<HTMLChGridColumnsetElement>;
            "ch-grid-rowset": LocalJSX.ChGridRowset & JSXBase.HTMLAttributes<HTMLChGridRowsetElement>;
            "ch-grid-rowset-legend": LocalJSX.ChGridRowsetLegend & JSXBase.HTMLAttributes<HTMLChGridRowsetLegendElement>;
            "ch-grid-settings": LocalJSX.ChGridSettings & JSXBase.HTMLAttributes<HTMLChGridSettingsElement>;
            "ch-grid-settings-columns": LocalJSX.ChGridSettingsColumns & JSXBase.HTMLAttributes<HTMLChGridSettingsColumnsElement>;
            "ch-icon": LocalJSX.ChIcon & JSXBase.HTMLAttributes<HTMLChIconElement>;
            "ch-paginator": LocalJSX.ChPaginator & JSXBase.HTMLAttributes<HTMLChPaginatorElement>;
            "ch-paginator-navigate": LocalJSX.ChPaginatorNavigate & JSXBase.HTMLAttributes<HTMLChPaginatorNavigateElement>;
            "ch-paginator-pages": LocalJSX.ChPaginatorPages & JSXBase.HTMLAttributes<HTMLChPaginatorPagesElement>;
            "ch-qr": LocalJSX.ChQr & JSXBase.HTMLAttributes<HTMLChQrElement>;
            "ch-select": LocalJSX.ChSelect & JSXBase.HTMLAttributes<HTMLChSelectElement>;
            "ch-sidebar-menu": LocalJSX.ChSidebarMenu & JSXBase.HTMLAttributes<HTMLChSidebarMenuElement>;
            "ch-sidebar-menu-list": LocalJSX.ChSidebarMenuList & JSXBase.HTMLAttributes<HTMLChSidebarMenuListElement>;
            "ch-sidebar-menu-list-item": LocalJSX.ChSidebarMenuListItem & JSXBase.HTMLAttributes<HTMLChSidebarMenuListItemElement>;
            "ch-step-list": LocalJSX.ChStepList & JSXBase.HTMLAttributes<HTMLChStepListElement>;
            "ch-step-list-item": LocalJSX.ChStepListItem & JSXBase.HTMLAttributes<HTMLChStepListItemElement>;
            "ch-tree": LocalJSX.ChTree & JSXBase.HTMLAttributes<HTMLChTreeElement>;
            "ch-tree-item": LocalJSX.ChTreeItem & JSXBase.HTMLAttributes<HTMLChTreeItemElement>;
            "ch-window": LocalJSX.ChWindow & JSXBase.HTMLAttributes<HTMLChWindowElement>;
            "gx-grid-chameleon": LocalJSX.GxGridChameleon & JSXBase.HTMLAttributes<HTMLGxGridChameleonElement>;
        }
    }
}
