/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
  interface ChIcon {
    /**
     * If enabled, the icon will display its inherent/natural color
     */
    autoColor: boolean;
    /**
     * If enabled, the icon will be loaded lazily when it's visible in the viewport.
     */
    lazy: boolean;
    /**
     * The URL of the icon.
     */
    src: string;
  }
  interface ChSidebarMenu {
    /**
     * The menu title
     */
    menuTitle: string;
    /**
     * The presence of this attribute allows the menu to have only one list opened at the same time
     */
    singleListOpen: boolean;
  }
  interface ChSidebarMenuList {}
  interface ChSidebarMenuListItem {
    /**
     * The first list item icon (optional)
     */
    itemIconSrc: string;
  }
}
declare global {
  interface HTMLChIconElement extends Components.ChIcon, HTMLStencilElement {}
  var HTMLChIconElement: {
    prototype: HTMLChIconElement;
    new (): HTMLChIconElement;
  };
  interface HTMLChSidebarMenuElement
    extends Components.ChSidebarMenu,
      HTMLStencilElement {}
  var HTMLChSidebarMenuElement: {
    prototype: HTMLChSidebarMenuElement;
    new (): HTMLChSidebarMenuElement;
  };
  interface HTMLChSidebarMenuListElement
    extends Components.ChSidebarMenuList,
      HTMLStencilElement {}
  var HTMLChSidebarMenuListElement: {
    prototype: HTMLChSidebarMenuListElement;
    new (): HTMLChSidebarMenuListElement;
  };
  interface HTMLChSidebarMenuListItemElement
    extends Components.ChSidebarMenuListItem,
      HTMLStencilElement {}
  var HTMLChSidebarMenuListItemElement: {
    prototype: HTMLChSidebarMenuListItemElement;
    new (): HTMLChSidebarMenuListItemElement;
  };
  interface HTMLElementTagNameMap {
    "ch-icon": HTMLChIconElement;
    "ch-sidebar-menu": HTMLChSidebarMenuElement;
    "ch-sidebar-menu-list": HTMLChSidebarMenuListElement;
    "ch-sidebar-menu-list-item": HTMLChSidebarMenuListItemElement;
  }
}
declare namespace LocalJSX {
  interface ChIcon {
    /**
     * If enabled, the icon will display its inherent/natural color
     */
    autoColor?: boolean;
    /**
     * If enabled, the icon will be loaded lazily when it's visible in the viewport.
     */
    lazy?: boolean;
    /**
     * The URL of the icon.
     */
    src?: string;
  }
  interface ChSidebarMenu {
    /**
     * The menu title
     */
    menuTitle?: string;
    onItemClicked?: (event: CustomEvent<any>) => void;
    /**
     * The presence of this attribute allows the menu to have only one list opened at the same time
     */
    singleListOpen?: boolean;
  }
  interface ChSidebarMenuList {}
  interface ChSidebarMenuListItem {
    /**
     * The first list item icon (optional)
     */
    itemIconSrc?: string;
    /**
     * Emmits the item id
     */
    onItemClickedEvent?: (event: CustomEvent<any>) => void;
  }
  interface IntrinsicElements {
    "ch-icon": ChIcon;
    "ch-sidebar-menu": ChSidebarMenu;
    "ch-sidebar-menu-list": ChSidebarMenuList;
    "ch-sidebar-menu-list-item": ChSidebarMenuListItem;
  }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      "ch-icon": LocalJSX.ChIcon & JSXBase.HTMLAttributes<HTMLChIconElement>;
      "ch-sidebar-menu": LocalJSX.ChSidebarMenu &
        JSXBase.HTMLAttributes<HTMLChSidebarMenuElement>;
      "ch-sidebar-menu-list": LocalJSX.ChSidebarMenuList &
        JSXBase.HTMLAttributes<HTMLChSidebarMenuListElement>;
      "ch-sidebar-menu-list-item": LocalJSX.ChSidebarMenuListItem &
        JSXBase.HTMLAttributes<HTMLChSidebarMenuListItemElement>;
    }
  }
}
