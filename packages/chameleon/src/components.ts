// Types used by properties, events and methods
import type { TemplateResult, LitElement } from "lit";
import type { ChVirtualScrollerCustomEvent } from "./components.ts";
import type { BreadCrumbItemModel, BreadCrumbModel, BreadCrumbHyperlinkClickEvent } from "./components/breadcrumb/types.ts";
import type { ChatTranslations } from "./components/chat/translations.ts";
import type { ChatCallbacks, ChatMessage, ChatLiveModeConfiguration, ChatMessageRenderByItem, ChatMessageRenderBySections, ChatSendContainerLayout, ChatMessageByRole, ChatMessageUser, ChatMessageByRoleNoId } from "./components/chat/types.ts";
import type { EditInputMode, EditTranslations, EditType } from "./components/edit/types.ts";
import type { LayoutSplitterModel, LayoutSplitterItemAddResult, LayoutSplitterLeafModel, LayoutSplitterItemRemoveResult } from "./components/layout-splitter/types.ts";
import type { NavigationListItemModel, NavigationListSharedState, NavigationListModel, NavigationListHyperlinkClickEvent } from "./components/navigation-list/types.ts";
import type { ComponentRenderModel, ComponentRenderTemplateItemNode } from "./components/playground-editor/typings/component-render.ts";
import type { ErrorCorrectionLevel } from "./components/qr/types.ts";
import type { RadioGroupModel } from "./components/radio-group/types.ts";
import type { RouterModel } from "./components/router/types.ts";
import type { SegmentedControlModel } from "./components/segmented-control/types.ts";
import type { ShowcaseApiProperties } from "./components/showcase/showcase-api/types.ts";
import type { SmartGridDataState } from "./components/smart-grid/internal/infinite-scroll/types.ts";
import type { SmartGridModel } from "./components/smart-grid/types.ts";
import type { TabularGridSortDirection, TabularGridModel } from "./components/tabular-grid/types.ts";
import type { ThemeModel, ChThemeLoadedEvent } from "./components/theme/theme-types.ts";
import type { VirtualScrollVirtualItems } from "./components/virtual-scroller/types.ts";
import type { ItemLink } from "./typings/hyperlinks.ts";
import type { GxImageMultiState, ImageRender, GetImagePathCallback } from "./typings/multi-state-images.ts";

export type { TemplateResult, LitElement };
export type { ChVirtualScrollerCustomEvent };
export type { BreadCrumbItemModel, BreadCrumbModel, BreadCrumbHyperlinkClickEvent };
export type { ChatTranslations };
export type { ChatCallbacks, ChatMessage, ChatLiveModeConfiguration, ChatMessageRenderByItem, ChatMessageRenderBySections, ChatSendContainerLayout, ChatMessageByRole, ChatMessageUser, ChatMessageByRoleNoId };
export type { EditInputMode, EditTranslations, EditType };
export type { LayoutSplitterModel, LayoutSplitterItemAddResult, LayoutSplitterLeafModel, LayoutSplitterItemRemoveResult };
export type { NavigationListItemModel, NavigationListSharedState, NavigationListModel, NavigationListHyperlinkClickEvent };
export type { ComponentRenderModel, ComponentRenderTemplateItemNode };
export type { ErrorCorrectionLevel };
export type { RadioGroupModel };
export type { RouterModel };
export type { SegmentedControlModel };
export type { ShowcaseApiProperties };
export type { SmartGridDataState };
export type { SmartGridModel };
export type { TabularGridSortDirection, TabularGridModel };
export type { ThemeModel, ChThemeLoadedEvent };
export type { VirtualScrollVirtualItems };
export type { ItemLink };
export type { GxImageMultiState, ImageRender, GetImagePathCallback };

// Component class types
import type { ChBeautifulMermaid as ChBeautifulMermaidElement } from "./components/beautiful-mermaid/beautiful-mermaid.lit.ts";
import type { ChBreadCrumbRender as ChBreadCrumbRenderElement } from "./components/breadcrumb/breadcrumb-render.lit.ts";
import type { ChBreadCrumbItem as ChBreadCrumbItemElement } from "./components/breadcrumb/internal/breadcrumb-item/breadcrumb-item.lit.ts";
import type { ChChat as ChChatElement } from "./components/chat/chat.lit.ts";
import type { ChChatRenderLit as ChChatRenderLitElement } from "./components/chat/internal/chat-render.lit.ts";
import type { ChCheckbox as ChCheckboxElement } from "./components/checkbox/checkbox.lit.ts";
import type { ChCode as ChCodeElement } from "./components/code/code.lit.ts";
import type { ChEdit as ChEditElement } from "./components/edit/edit.lit.ts";
import type { ChImage as ChImageElement } from "./components/image/image.lit.ts";
import type { ChLayoutSplitter as ChLayoutSplitterElement } from "./components/layout-splitter/layout-splitter.lit.ts";
import type { ChMarkdownViewer as ChMarkdownViewerElement } from "./components/markdown-viewer/markdown-viewer.lit.ts";
import type { ChNavigationListItem as ChNavigationListItemElement } from "./components/navigation-list/internal/navigation-list-item/navigation-list-item.lit.ts";
import type { ChNavigationListRender as ChNavigationListRenderElement } from "./components/navigation-list/navigation-list-render.lit.ts";
import type { ChPerformanceScanItem as ChPerformanceScanItemElement } from "./components/performance-scan/internals/performance-scan-item/performance-scan-item.lit.ts";
import type { ChPerformanceScan as ChPerformanceScanElement } from "./components/performance-scan/performance-scan.lit.ts";
import type { ChComponentRender as ChComponentRenderElement } from "./components/playground-editor/internal/component-render/component-render.lit.ts";
import type { ChPlaygroundEditor as ChPlaygroundEditorElement } from "./components/playground-editor/playground-editor.lit.ts";
import type { ChProgress as ChProgressElement } from "./components/progress/progress.lit.ts";
import type { ChQr as ChQrElement } from "./components/qr/qr.lit.ts";
import type { ChRadioGroupRender as ChRadioGroupRenderElement } from "./components/radio-group/radio-group-render.lit.ts";
import type { ChRouter as ChRouterElement } from "./components/router/router.lit.ts";
import type { ChSegmentedControlItem as ChSegmentedControlItemElement } from "./components/segmented-control/internal/segmented-control-item/segmented-control-item.lit.ts";
import type { ChSegmentedControlRender as ChSegmentedControlRenderElement } from "./components/segmented-control/segmented-control-render.lit.ts";
import type { ChShowcaseApi as ChShowcaseApiElement } from "./components/showcase/showcase-api/showcase-api.lit.ts";
import type { ChSidebar as ChSidebarElement } from "./components/sidebar/sidebar.lit.ts";
import type { ChSlider as ChSliderElement } from "./components/slider/slider.lit.ts";
import type { ChSmartGrid as ChSmartGridElement } from "./components/smart-grid/smart-grid.lit.ts";
import type { ChSwitch as ChSwitchElement } from "./components/switch/switch.lit.ts";
import type { ChTabularGridColumn as ChTabularGridColumnElement } from "./components/tabular-grid/internal/tabular-grid-column/tabular-grid-column.lit.ts";
import type { ChTabularGridRender as ChTabularGridRenderElement } from "./components/tabular-grid/tabular-grid-render.lit.ts";
import type { ChTextBlock as ChTextBlockElement } from "./components/textblock/textblock.lit.ts";
import type { ChTheme as ChThemeElement } from "./components/theme/theme.lit.ts";
import type { ChVirtualScroller as ChVirtualScrollerElement } from "./components/virtual-scroller/virtual-scroller.lit.ts";

/**
 * Each interface contains the base class of the custom elements of the
 * library.
 */
export interface ComponentBaseClasses {
  "ch-beautiful-mermaid": ChBeautifulMermaidElement;
  "ch-breadcrumb-render": ChBreadCrumbRenderElement;
  "ch-breadcrumb-item": ChBreadCrumbItemElement;
  "ch-chat": ChChatElement;
  "ch-chat-render-lit": ChChatRenderLitElement;
  "ch-checkbox": ChCheckboxElement;
  "ch-code": ChCodeElement;
  "ch-edit": ChEditElement;
  "ch-image": ChImageElement;
  "ch-layout-splitter": ChLayoutSplitterElement;
  "ch-markdown-viewer": ChMarkdownViewerElement;
  "ch-navigation-list-item": ChNavigationListItemElement;
  "ch-navigation-list-render": ChNavigationListRenderElement;
  "ch-performance-scan-item": ChPerformanceScanItemElement;
  "ch-performance-scan": ChPerformanceScanElement;
  "ch-component-render": ChComponentRenderElement;
  "ch-playground-editor": ChPlaygroundEditorElement;
  "ch-progress": ChProgressElement;
  "ch-qr": ChQrElement;
  "ch-radio-group-render": ChRadioGroupRenderElement;
  "ch-router": ChRouterElement;
  "ch-segmented-control-item": ChSegmentedControlItemElement;
  "ch-segmented-control-render": ChSegmentedControlRenderElement;
  "ch-showcase-api": ChShowcaseApiElement;
  "ch-sidebar": ChSidebarElement;
  "ch-slider": ChSliderElement;
  "ch-smart-grid": ChSmartGridElement;
  "ch-switch": ChSwitchElement;
  "ch-tabular-grid-column": ChTabularGridColumnElement;
  "ch-tabular-grid-render": ChTabularGridRenderElement;
  "ch-textblock": ChTextBlockElement;
  "ch-theme": ChThemeElement;
  "ch-virtual-scroller": ChVirtualScrollerElement;
}

/**
 * Each interface contains the properties of the custom elements of the library.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComponentProperties {
  export type ChBeautifulMermaid = Pick<ChBeautifulMermaidElement, "value">;
  export type ChBreadCrumbRender = Pick<ChBreadCrumbRenderElement, "getImagePathCallback" | "selectedLink" | "selectedLinkIndicator" | "model" | "separator" | "accessibleName">;
  export type ChBreadCrumbItem = Pick<ChBreadCrumbItemElement, "caption" | "disabled" | "accessibleName" | "link" | "model" | "selected" | "selectedLinkIndicator" | "startImgSrc" | "startImgType" | "getImagePathCallback">;
  export type ChChat = Pick<ChChatElement, "autoScroll" | "callbacks" | "disabled" | "items" | "liveMode" | "liveModeConfiguration" | "loadingState" | "markdownTheme" | "newUserMessageAlignment" | "newUserMessageScrollBehavior" | "renderItem" | "sendButtonDisabled" | "sendInputDisabled" | "showAdditionalContent" | "sendContainerLayout" | "theme" | "translations" | "virtualScrollerBufferSize" | "waitingResponse">;
  export type ChChatRenderLit = Pick<ChChatRenderLitElement, "cellHasToReserveSpace" | "cellIdAlignedWhenRendered" | "chatRef" | "liveKitMessages" | "newUserMessageAlignment" | "newUserMessageScrollBehavior" | "renderItem" | "smartGridRef" | "virtualItems">;
  export type ChCheckbox = Pick<ChCheckboxElement, "accessibleName" | "caption" | "checked" | "disabled" | "getImagePathCallback" | "indeterminate" | "name" | "readonly" | "startImgSrc" | "startImgType" | "value">;
  export type ChCode = Pick<ChCodeElement, "language" | "lastNestedChildClass" | "showIndicator" | "value">;
  export type ChEdit = Pick<ChEditElement, "accessibleName" | "autocapitalize" | "autocomplete" | "autoFocus" | "autoGrow" | "debounce" | "disabled" | "getImagePathCallback" | "hostParts" | "maxLength" | "mode" | "multiline" | "name" | "pattern" | "picture" | "pictureCallback" | "placeholder" | "preventEnterInInputEditorMode" | "readonly" | "showAdditionalContentAfter" | "showAdditionalContentBefore" | "showPassword" | "showPasswordButton" | "spellcheck" | "startImgSrc" | "startImgType" | "translations" | "type" | "value">;
  export type ChImage = Pick<ChImageElement, "containerRef" | "disabled" | "getImagePathCallback" | "src" | "styles" | "type">;
  export type ChLayoutSplitter = Pick<ChLayoutSplitterElement, "barAccessibleName" | "dragBarDisabled" | "incrementWithKeyboard" | "model">;
  export type ChMarkdownViewer = Pick<ChMarkdownViewerElement, "value" | "showIndicator" | "renderCode" | "theme">;
  export type ChNavigationListItem = Pick<ChNavigationListItemElement, "caption" | "disabled" | "expandable" | "expanded" | "exportparts" | "level" | "link" | "model" | "selected" | "sharedState" | "startImgSrc" | "startImgType">;
  export type ChNavigationListRender = Pick<ChNavigationListRenderElement, "autoGrow" | "expandableButton" | "expandableButtonPosition" | "getImagePathCallback" | "expanded" | "expandSelectedLink" | "model" | "renderItem" | "selectedLink" | "selectedLinkIndicator" | "showCaptionOnCollapse" | "tooltipDelay">;
  export type ChPerformanceScanItem = Pick<ChPerformanceScanItemElement, "anchorRef" | "anchorTagName" | "renderCount">;
  export type ChPerformanceScan = Pick<ChPerformanceScanElement, "showFps">;
  export type ChComponentRender = Pick<ChComponentRenderElement, "model">;
  export type ChPlaygroundEditor = Pick<ChPlaygroundEditorElement, "componentModel" | "componentName" | "selectedItem">;
  export type ChProgress = Pick<ChProgressElement, "accessibleName" | "accessibleValueText" | "indeterminate" | "max" | "min" | "name" | "renderType" | "loadingRegionRef" | "value">;
  export type ChQr = Pick<ChQrElement, "accessibleName" | "background" | "errorCorrectionLevel" | "fill" | "radius" | "size" | "value">;
  export type ChRadioGroupRender = Pick<ChRadioGroupRenderElement, "direction" | "disabled" | "model" | "name" | "value">;
  export type ChRouter = Pick<ChRouterElement, "model" | "pathname">;
  export type ChSegmentedControlItem = Pick<ChSegmentedControlItemElement, "accessibleName" | "between" | "caption" | "disabled" | "endImgSrc" | "endImgType" | "first" | "last" | "selected" | "startImgSrc" | "startImgType">;
  export type ChSegmentedControlRender = Pick<ChSegmentedControlRenderElement, "exportParts" | "itemCssClass" | "model" | "selectedId">;
  export type ChShowcaseApi = Pick<ChShowcaseApiElement, "properties">;
  export type ChSidebar = Pick<ChSidebarElement, "expandButtonCollapseAccessibleName" | "expandButtonExpandAccessibleName" | "expandButtonCollapseCaption" | "expandButtonExpandCaption" | "expandButtonPosition" | "expanded" | "showExpandButton">;
  export type ChSlider = Pick<ChSliderElement, "accessibleName" | "disabled" | "maxValue" | "minValue" | "name" | "showValue" | "step" | "value">;
  export type ChSmartGrid = Pick<ChSmartGridElement, "accessibleName" | "autoGrow" | "autoScroll" | "dataProvider" | "inverseLoading" | "itemsCount" | "loadingState" | "threshold">;
  export type ChSwitch = Pick<ChSwitchElement, "accessibleName" | "checkedCaption" | "checked" | "disabled" | "name" | "readonly" | "unCheckedCaption" | "value">;
  export type ChTabularGridColumn = Pick<ChTabularGridColumnElement, "accessibleName" | "caption" | "colSpan" | "colStart" | "parts" | "resizable" | "rowSpan" | "size" | "styles" | "sortable" | "sortDirection">;
  export type ChTabularGridRender = Pick<ChTabularGridRenderElement, "columnHideable" | "columnResizable" | "columnSortable" | "model">;
  export type ChTextBlock = Pick<ChTextBlockElement, "autoGrow" | "caption" | "characterToMeasureLineHeight" | "format" | "showTooltipOnOverflow">;
  export type ChTheme = Pick<ChThemeElement, "attachStyleSheets" | "avoidFlashOfUnstyledContent" | "hidden" | "model" | "timeout">;
  export type ChVirtualScroller = Pick<ChVirtualScrollerElement, "bufferAmount" | "initialRenderViewportItems" | "inverseLoading" | "items" | "itemsCount" | "mode">;
}

/**
 * Each interface contains the properties of the custom elements of the library.
 * This format is used for SolidJS applications.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComponentPropertiesSolidJS {
  export type ChBeautifulMermaid = {
    /**
     * Specifies the Mermaid diagram definition to be rendered.
     */
    "prop:value"?:  string | undefined;
  };

  export type ChBreadCrumbRender = {
    /**
     * This property specifies a callback that is executed when the path for an
     * startImgSrc needs to be resolved.
     */
    "prop:getImagePathCallback"?: 
      | ((item: BreadCrumbItemModel) => GxImageMultiState | undefined)
      | undefined;

    /**
     * Specifies the current selected hyperlink.
     */
    "prop:selectedLink"?:  {
      id?: string;
      link: ItemLink;
    };

    /**
     * Specifies if the selected item indicator is displayed (only work for hyperlink)
     */
    "prop:selectedLinkIndicator"?:  boolean;

    /**
     * Specifies the items of the control.
     */
    "prop:model"?:  BreadCrumbModel | undefined;

    /**
     * 
     */
    "prop:separator"?:  string | undefined;

    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;
  };

  export type ChBreadCrumbItem = {
    /**
     * Specifies the caption of the control
     */
    "prop:caption"?:  string | undefined;

    /**
     * This attribute lets you specify if the element is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean | undefined;

    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * 
     */
    "prop:link"?:  ItemLink | undefined;

    /**
     * Specifies the UI model of the control
     */
    "prop:model"?:  BreadCrumbItemModel;

    /**
     * Specifies if the hyperlink is selected. Only applies when the `link`
     * property is defined.
     */
    "prop:selected"?:  boolean;

    /**
     * Specifies if the selected item indicator is displayed when the item is
     * selected. Only applies when the `link` property is defined.
     */
    "prop:selectedLinkIndicator"?:  boolean;

    /**
     * Specifies the src of the start image.
     */
    "prop:startImgSrc"?:  string | undefined;

    /**
     * Specifies how the start image will be rendered.
     */
    "prop:startImgType"?: 
      | Exclude<ImageRender, "img">
      | undefined;

    /**
     * This property specifies a callback that is executed when the path for an
     * startImgSrc needs to be resolved.
     */
    "prop:getImagePathCallback"?: 
      | ((imageSrc: BreadCrumbItemModel) => GxImageMultiState | undefined)
      | undefined;
  };

  export type ChChat = {
    /**
     * 
     */
    "prop:autoScroll"?: 
      | "never"
      | "at-scroll-end";

    /**
     * 
     */
    "prop:callbacks"?:  ChatCallbacks | undefined;

    /**
     * 
     */
    "prop:disabled"?:  boolean;

    /**
     * 
     */
    "prop:items"?:  ChatMessage[];

    /**
     * 
     */
    "prop:liveMode"?:  boolean;

    /**
     * 
     */
    "prop:liveModeConfiguration"?:  ChatLiveModeConfiguration | undefined;

    /**
     * 
     */
    "prop:loadingState"?:  SmartGridDataState;

    /**
     * 
     */
    "prop:markdownTheme"?:  string | null;

    /**
     * 
     */
    "prop:newUserMessageAlignment"?:  "start" | "end";

    /**
     * 
     */
    "prop:newUserMessageScrollBehavior"?:  Exclude<ScrollBehavior, "auto">;

    /**
     * 
     */
    "prop:renderItem"?: 
      | ChatMessageRenderByItem
      | ChatMessageRenderBySections
      | undefined;

    /**
     * 
     */
    "prop:sendButtonDisabled"?:  boolean;

    /**
     * 
     */
    "prop:sendInputDisabled"?:  boolean;

    /**
     * 
     */
    "prop:showAdditionalContent"?:  boolean;

    /**
     * 
     */
    "prop:sendContainerLayout"?:  ChatSendContainerLayout;

    /**
     * 
     */
    "prop:theme"?:  ThemeModel | undefined;

    /**
     * 
     */
    "prop:translations"?:  ChatTranslations;

    /**
     * 
     */
    "prop:virtualScrollerBufferSize"?:  number;

    /**
     * 
     */
    "prop:waitingResponse"?: 
      | boolean;
  };

  export type ChChatRenderLit = {
    /**
     * Specifies a Set of cells that must render an additional div to correctly
     * reserve space. This space is used to align the cell at the start scroll
     * position.
     * 
     * Even if only one cell is aligned to the start of the scroll, all cells
     * that participated in this behavior must maintain the additional rendered
     * div to avoid destroying the DOM and thus causing some side effects on
     * elements whose state the chat can not control.
     */
    "prop:cellHasToReserveSpace"?: 
      | Set<string>
      | undefined;

    /**
     * 
     */
    "prop:cellIdAlignedWhenRendered"?: 
      | string
      | undefined;

    /**
     * Specifies the reference for the ch-chat parent.
     */
    "prop:chatRef"?:  HTMLDivElement | undefined;

    /**
     * Specifies the live kit messages that are rendered when liveMode = true in
     * the `ch-chat`
     */
    "prop:liveKitMessages"?:  ChatMessage[];

    /**
     * Specifies how the messages added by the user interaction will be aligned
     * in the chat.
     * 
     * If `newUserMessageAlignment === "start"` the chat will reserve the
     * necessary space to visualize the message at the start of the content
     * viewport if the content is not large enough.
     * This behavior is the same as the Monaco editor does for reserving space
     * when visualizing the last lines positioned at the top of the editor.
     */
    "prop:newUserMessageAlignment"?:  "start" | "end";

    /**
     * Specifies how the chat will scroll to the position of the messages added
     * by user interaction.
     */
    "prop:newUserMessageScrollBehavior"?:  Exclude<
      ScrollBehavior,
      "auto"
    >;

    /**
     * This property allows us to implement custom rendering of chat items.
     * 
     * This works by providing a custom render of the cell content in two
     * possible ways:
     *   1. Replacing the render of the entire cell with a function of the
     *   message model.
     * 
     *   2. Replacing the render of specific parts of the message by providing an
     *   object with the specific renders of the message sections (`codeBlock`,
     *   `content`, `files` and/or `messageStructure`).
     */
    "prop:renderItem"?: 
      | ChatMessageRenderByItem
      | ChatMessageRenderBySections;

    /**
     * Specifies the reference for the smart grid parent.
     * 
     * This property is useful to avoid the cell from queering the ch-smart-grid
     * ref on the initial load.
     */
    "prop:smartGridRef"?:  HTMLDivElement;

    /**
     * Specifies the virtual items that the chat will display.
     */
    "prop:virtualItems"?:  ChatMessage[];
  };

  export type ChCheckbox = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * Specifies the label of the checkbox.
     */
    "prop:caption"?:  string | undefined;

    /**
     * `true` if the `ch-switch` is checked.
     * 
     * If checked:
     *   - The `value` property will be available in the parent `<form>` if the
     *     `name` attribute is set.
     *   - The `checkedCaption` will be used to display the current caption.
     * 
     * If not checked:
     *   - The `value` property won't be available in the parent `<form>`, even
     *     if the `name` attribute is set.
     *   - The `unCheckedCaption` will be used to display the current caption.
     */
    "prop:checked"?:  boolean;

    /**
     * This attribute lets you specify if the element is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean;

    /**
     * This property specifies a callback that is executed when the path for an
     * startImgSrc needs to be resolved.
     */
    "prop:getImagePathCallback"?: 
      | GetImagePathCallback
      | undefined;

    /**
     * `true` if the control's value is indeterminate.
     * 
     * This property is purely a visual change. It has no impact on whether the
     * checkbox's is used in a form submission. That is decided by the
     * `checked` property, regardless of the `indeterminate` state.
     */
    "prop:indeterminate"?:  boolean;

    /**
     * Specifies the `name` of the component when used in a form.
     */
    "prop:name"?:  string | undefined;

    /**
     * This attribute indicates that the user cannot modify the value of the control.
     * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
     * attribute for `input` elements.
     */
    "prop:readonly"?:  boolean;

    /**
     * Specifies the source of the start image.
     */
    "prop:startImgSrc"?:  string | undefined;

    /**
     * Specifies the source of the start image.
     */
    "prop:startImgType"?:  Exclude<
      ImageRender,
      "img"
    >;

    /**
     * The value of the control.
     */
    "prop:value"?:  string;
  };

  export type ChCode = {
    /**
     * Specifies the code language to highlight.
     */
    "prop:language"?:  string | undefined;

    /**
     * 
     */
    "prop:lastNestedChildClass"?:  string;

    /**
     * Specifies if an indicator is displayed in the last element rendered.
     * Useful for streaming scenarios where a loading indicator is needed.
     */
    "prop:showIndicator"?:  boolean;

    /**
     * Specifies the code string to highlight.
     */
    "prop:value"?:  string | undefined;
  };

  export type ChEdit = {
    /**
     * 
     */
    "prop:accessibleName"?:  string;

    /**
     * 
     */
    "prop:autocapitalize"?:  string;

    /**
     * 
     */
    "prop:autocomplete"?: 
      | "on"
      | "off"
      | "current-password"
      | "new-password";

    /**
     * 
     */
    "prop:autoFocus"?:  boolean;

    /**
     * 
     */
    "prop:autoGrow"?:  boolean;

    /**
     * 
     */
    "prop:debounce"?:  number;

    /**
     * 
     */
    "prop:disabled"?:  boolean;

    /**
     * 
     */
    "prop:getImagePathCallback"?:  (
      imageSrc: string
    ) => GxImageMultiState | undefined;

    /**
     * 
     */
    "prop:hostParts"?:  string;

    /**
     * 
     */
    "prop:maxLength"?: 
      | number
      | undefined;

    /**
     * 
     */
    "prop:mode"?:  EditInputMode | undefined;

    /**
     * 
     */
    "prop:multiline"?:  boolean;

    /**
     * 
     */
    "prop:name"?:  string;

    /**
     * 
     */
    "prop:pattern"?:  string;

    /**
     * 
     */
    "prop:picture"?:  string;

    /**
     * 
     */
    "prop:pictureCallback"?:  (
      value: any,
      picture: string
    ) => string;

    /**
     * 
     */
    "prop:placeholder"?:  string;

    /**
     * 
     */
    "prop:preventEnterInInputEditorMode"?:  boolean;

    /**
     * 
     */
    "prop:readonly"?:  boolean;

    /**
     * 
     */
    "prop:showAdditionalContentAfter"?:  boolean;

    /**
     * 
     */
    "prop:showAdditionalContentBefore"?:  boolean;

    /**
     * 
     */
    "prop:showPassword"?: 
      | boolean;

    /**
     * 
     */
    "prop:showPasswordButton"?:  boolean;

    /**
     * 
     */
    "prop:spellcheck"?:  boolean;

    /**
     * 
     */
    "prop:startImgSrc"?:  string;

    /**
     * 
     */
    "prop:startImgType"?:  Exclude<
      ImageRender,
      "img"
    >;

    /**
     * 
     */
    "prop:translations"?:  EditTranslations;

    /**
     * 
     */
    "prop:type"?:  EditType;

    /**
     * 
     */
    "prop:value"?:  string;
  };

  export type ChImage = {
    /**
     * Specifies a reference for the container, in order to update the state of
     * the icon. The reference must be an ancestor of the control.
     * If not specified, the direct parent reference will be used.
     */
    "prop:containerRef"?:  HTMLElement | undefined;

    /**
     * Specifies if the icon is disabled.
     */
    "prop:disabled"?:  boolean | undefined;

    /**
     * This property specifies a callback that is executed when the path the
     * image needs to be resolved.
     */
    "prop:getImagePathCallback"?: 
      | GetImagePathCallback
      | undefined;

    /**
     * Specifies the src for the image.
     */
    "prop:src"?:  string | unknown | undefined;

    /**
     * Specifies an accessor for the attribute style of the ch-image. This
     * accessor is useful for SSR scenarios were the Host access is limited
     * (since Lit does not provide the Host declarative component).
     * 
     * Without this accessor, the initial load in SSR scenarios would flicker.
     */
    "prop:styles"?:  string | undefined;

    /**
     * Specifies how the image will be rendered.
     */
    "prop:type"?: 
      | Exclude<ImageRender, "img">
      | undefined;
  };

  export type ChLayoutSplitter = {
    /**
     * This attribute lets you specify the label for the drag bar.
     * Important for accessibility.
     */
    "prop:barAccessibleName"?:  string;

    /**
     * This attribute lets you specify if the resize operation is disabled in all
     * drag bars. If `true`, the drag bars are disabled.
     */
    "prop:dragBarDisabled"?:  boolean;

    /**
     * Specifies the resizing increment (in pixel) that is applied when using the
     * keyboard to resize a drag bar.
     */
    "prop:incrementWithKeyboard"?:  number;

    /**
     * Specifies the list of component that are displayed. Each component will be
     * separated via a drag bar.
     */
    "prop:model"?:  LayoutSplitterModel;
  };

  export type ChMarkdownViewer = {
    /**
     * 
     */
    "prop:value"?:  string;

    /**
     * 
     */
    "prop:showIndicator"?:  boolean;

    /**
     * 
     */
    "prop:renderCode"?:  any;

    /**
     * 
     */
    "prop:theme"?:  any;
  };

  export type ChNavigationListItem = {
    /**
     * Specifies the caption of the control
     */
    "prop:caption"?:  string | undefined;

    /**
     * This attribute lets you specify if the element is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean | undefined;

    /**
     * Specifies if the control contains sub items.
     */
    "prop:expandable"?:  boolean;

    /**
     * Specifies if the control is expanded or collapsed.
     */
    "prop:expanded"?:  boolean | undefined;

    /**
     * This property works the same as the exportparts attribute. It is defined
     * as a property just to reflect the default value, which avoids FOUC when
     * the `ch-navigation-list-render` component is Server Side Rendered.
     * Otherwise, setting this attribute on the client would provoke FOUC and/or
     * visual flickering.
     */
    "prop:exportparts"?:  string;

    /**
     * Specifies at which level of the navigation list is rendered the control.
     */
    "prop:level"?:  number;

    /**
     * 
     */
    "prop:link"?:  ItemLink | undefined;

    /**
     * Specifies the UI model of the control
     */
    "prop:model"?:  NavigationListItemModel;

    /**
     * Specifies if the hyperlink is selected. Only applies when the `link`
     * property is defined.
     */
    "prop:selected"?:  boolean;

    /**
     * 
     */
    "prop:sharedState"?:  NavigationListSharedState;

    /**
     * Specifies the src of the start image.
     */
    "prop:startImgSrc"?:  string | undefined;

    /**
     * Specifies how the start image will be rendered.
     */
    "prop:startImgType"?: 
      | Exclude<ImageRender, "img">
      | undefined;
  };

  export type ChNavigationListRender = {
    /**
     * If `false` the overflowing content of the control will be clipped to the
     * borders of its container.
     */
    "prop:autoGrow"?:  boolean;

    /**
     * Specifies what kind of expandable button is displayed in the items by
     * default.
     *  - `"decorative"`: Only a decorative icon is rendered to display the state
     *     of the item.
     */
    "prop:expandableButton"?: 
      | "decorative"
      | "no";

    /**
     * Specifies the position of the expandable button in reference of the action
     * element of the items
     *  - `"start"`: Expandable button is placed before the action element.
     *  - `"end"`: Expandable button is placed after the action element.
     */
    "prop:expandableButtonPosition"?:  "start" | "end";

    /**
     * This property specifies a callback that is executed when the path for an
     * startImgSrc needs to be resolved.
     */
    "prop:getImagePathCallback"?: 
      | ((item: NavigationListItemModel) => GxImageMultiState | undefined)
      | undefined;

    /**
     * Specifies if the control is expanded or collapsed.
     */
    "prop:expanded"?:  boolean;

    /**
     * `true` to expand the path to the selected link when the `selectedLink`
     * property is updated.
     */
    "prop:expandSelectedLink"?:  boolean;

    /**
     * Specifies the items of the control.
     */
    "prop:model"?: 
      | NavigationListModel
      | undefined;

    /**
     * Specifies the items of the control.
     */
    "prop:renderItem"?: 
      | ((
          item: NavigationListItemModel,
          navigationListSharedState: NavigationListSharedState,
          level: number
        ) => TemplateResult)
      | undefined;

    /**
     * Specifies the current selected hyperlink.
     */
    "prop:selectedLink"?:  {
      id?: string;
      link: ItemLink;
    };

    /**
     * Specifies if the selected item indicator is displayed (only work for hyperlink)
     */
    "prop:selectedLinkIndicator"?:  boolean;

    /**
     * Specifies how the caption of the items will be displayed when the control
     * is collapsed
     */
    "prop:showCaptionOnCollapse"?: 
      | "inline"
      | "tooltip";

    /**
     * Specifies the delay (in ms) for the tooltip to be displayed.
     */
    "prop:tooltipDelay"?:  number;
  };

  export type ChPerformanceScanItem = {
    /**
     * Specifies a reference for the scanned element.
     */
    "prop:anchorRef"?:  LitElement;

    /**
     * Specifies the tagName of the scanned element.
     */
    "prop:anchorTagName"?:  string;

    /**
     * Specifies how many times the scanned element has rendered in a buffer of
     * time.
     */
    "prop:renderCount"?:  number;
  };

  export type ChPerformanceScan = {
    /**
     * `true` to show the FPS
     */
    "prop:showFps"?:  boolean;
  };

  export type ChComponentRender = {
    /**
     * Specifies the component render.
     */
    "prop:model"?:  ComponentRenderModel;
  };

  export type ChPlaygroundEditor = {
    /**
     * 
     */
    "prop:componentModel"?: 
      | ComponentRenderModel
      | undefined;

    /**
     * 
     */
    "prop:componentName"?:  string | undefined;

    /**
     * 
     */
    "prop:selectedItem"?: 
      | ComponentRenderTemplateItemNode
      | undefined;
  };

  export type ChProgress = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * Assistive technologies often present the `value` as a percentage. If this
     * would not be accurate use this property to make the progress bar value
     * understandable.
     */
    "prop:accessibleValueText"?: 
      | string
      | undefined;

    /**
     * Specifies whether the progress is indeterminate or not. In other words, it
     * indicates that an activity is ongoing with no indication of how long it is
     * expected to take.
     * 
     * If `true`, the `max`, `min` and `value` properties won't be taken into
     * account.
     */
    "prop:indeterminate"?:  boolean;

    /**
     * Specifies the maximum value of progress. In other words, how much work the
     * task indicated by the progress component requires.
     * 
     * This property is not used if indeterminate === true.
     */
    "prop:max"?:  number;

    /**
     * Specifies the minimum value of progress.
     * 
     * This property is not used if indeterminate === true.
     */
    "prop:min"?:  number;

    /**
     * Specifies the `name` of the component when used in a form.
     */
    "prop:name"?:  string | undefined;

    /**
     * This property specifies how the progress will be render.
     *  - `"custom"`: Useful for making custom renders of the progress. The
     *    control doesn't render anything and only projects the content of the
     *    default slot. Besides that, all specified properties are still used to
     *    implement the control's accessibility.
     */
    "prop:renderType"?:  "custom" | string;

    /**
     * If the control is describing the loading progress of a particular region
     * of a page, set this property with the reference of the loading region.
     * This will set the `aria-describedby` and `aria-busy` attributes on the
     * loading region to improve the accessibility while the control is in
     * progress.
     * 
     * When the control detects that is no longer in progress (aka it is removed
     * from the DOM or value === maxValue with indeterminate === false), it will
     * remove the `aria-busy` attribute and update (or remove if necessary) the
     * `aria-describedby` attribute.
     * 
     * If an ID is set prior to the control's first render, the control will use
     * this ID for the `aria-describedby`. Otherwise, the control will compute a
     * unique ID for this matter.
     * 
     * **Important**: If you are using Shadow DOM, take into account that the
     * `loadingRegionRef` must be in the same Shadow Tree as this control.
     * Otherwise, the `aria-describedby` binding won't work, since the control ID
     * is not visible for the `loadingRegionRef`.
     */
    "prop:loadingRegionRef"?:  HTMLElement | undefined;

    /**
     * Specifies the current value of the component. In other words, how much of
     * the task that has been completed.
     * 
     * This property is not used if indeterminate === true.
     */
    "prop:value"?:  number;
  };

  export type ChQr = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * The background color of the render QR. If not specified, "transparent"
     * will be used.
     */
    "prop:background"?:  string;

    /**
     * The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
     * code for error correction respectively. So on one hand the code will get
     * bigger but chances are also higher that it will be read without errors
     * later on. This value is by default High (H).
     */
    "prop:errorCorrectionLevel"?:  ErrorCorrectionLevel;

    /**
     * What color you want your QR code to be.
     */
    "prop:fill"?:  string;

    /**
     * Defines how round the blocks should be. Numbers from 0 (squares) to 0.5
     * (maximum round) are supported.
     */
    "prop:radius"?:  number;

    /**
     * The total size of the final QR code in pixels.
     */
    "prop:size"?:  number;

    /**
     * Any kind of text, also links, email addresses, any thing.
     */
    "prop:value"?:  string | undefined;
  };

  export type ChRadioGroupRender = {
    /**
     * Specifies the direction of the items.
     */
    "prop:direction"?:  "horizontal" | "vertical";

    /**
     * This attribute lets you specify if the radio-group is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean;

    /**
     * This property lets you define the items of the ch-radio-group-render control.
     */
    "prop:model"?:  RadioGroupModel | undefined;

    /**
     * Specifies the `name` of the component when used in a form.
     */
    "prop:name"?:  string | undefined;

    /**
     * The value of the control.
     */
    "prop:value"?:  string | undefined;
  };

  export type ChRouter = {
    /**
     * 
     */
    "prop:model"?:  RouterModel | undefined;

    /**
     * 
     */
    "prop:pathname"?:  string | undefined;
  };

  export type ChSegmentedControlItem = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?:  string | undefined;

    /**
     * `true` if the control is the not the first or last item in the
     * ch-segmented-control-render.
     */
    "prop:between"?:  boolean;

    /**
     * Specifies the caption that the control will display.
     */
    "prop:caption"?:  string | undefined;

    /**
     * This attribute lets you specify if the element is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean | undefined;

    /**
     * Specifies the src of the end image.
     */
    "prop:endImgSrc"?:  string | undefined;

    /**
     * Specifies how the end image will be rendered.
     */
    "prop:endImgType"?:  Exclude<ImageRender, "img"> | undefined;

    /**
     * `true` if the control is the first item in the ch-segmented-control-render.
     */
    "prop:first"?:  boolean;

    /**
     * `true` if the control is the last item in the ch-segmented-control-render.
     */
    "prop:last"?:  boolean;

    /**
     * Specifies if the control is selected.
     */
    "prop:selected"?:  boolean | undefined;

    /**
     * Specifies the src of the start image.
     */
    "prop:startImgSrc"?:  string | undefined;

    /**
     * Specifies how the start image will be rendered.
     */
    "prop:startImgType"?:  Exclude<ImageRender, "img"> | undefined;
  };

  export type ChSegmentedControlRender = {
    /**
     * Specifies the parts that are exported by the internal
     * segmented-control-item. This property is useful to override the exported
     * parts.
     */
    "prop:exportParts"?:  string;

    /**
     * A CSS class to set as the `ch-segmented-control-item` element class.
     * This default class is used for the items that don't have an explicit class.
     */
    "prop:itemCssClass"?:  string;

    /**
     * This property lets you define the items of the ch-segmented-control-render
     * control.
     */
    "prop:model"?:  SegmentedControlModel | undefined;

    /**
     * Specifies the ID of the selected item
     */
    "prop:selectedId"?:  string | undefined;
  };

  export type ChShowcaseApi = {
    /**
     * Specifies the properties of the API.
     */
    "prop:properties"?:  ShowcaseApiProperties | undefined;
  };

  export type ChSidebar = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for expand button when `expanded = true`.
     */
    "prop:expandButtonCollapseAccessibleName"?:  string | undefined;

    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for expand button when `expanded = false`.
     */
    "prop:expandButtonExpandAccessibleName"?:  string | undefined;

    /**
     * Specifies the caption of the expand button when `expanded = true`.
     */
    "prop:expandButtonCollapseCaption"?:  string | undefined;

    /**
     * Specifies the caption of the expand button when `expanded = false`.
     */
    "prop:expandButtonExpandCaption"?:  string | undefined;

    /**
     * Specifies the position of the expand button relative to the content of the
     * sidebar.
     *  - `"before"`: The expand button is positioned before the content of the sidebar.
     *  - `"after"`: The expand button is positioned after the content of the sidebar.
     */
    "prop:expandButtonPosition"?:  "before" | "after";

    /**
     * Specifies whether the control is expanded or collapsed.
     */
    "prop:expanded"?:  boolean;

    /**
     * `true` to display a expandable button at the bottom of the control.
     */
    "prop:showExpandButton"?:  boolean;
  };

  export type ChSlider = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * This attribute allows you specify if the element is disabled.
     * If disabled, it will not trigger any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean;

    /**
     * This attribute lets you specify maximum value of the slider.
     */
    "prop:maxValue"?:  number;

    /**
     * This attribute lets you specify minimum value of the slider.
     */
    "prop:minValue"?:  number;

    /**
     * Specifies the `name` of the component when used in a form.
     */
    "prop:name"?:  string | undefined;

    /**
     * This attribute lets you indicate whether the control should display a
     * bubble with the current value upon interaction.
     */
    "prop:showValue"?:  boolean;

    /**
     * This attribute lets you specify the step of the slider.
     * 
     * This attribute is useful when the values of the slider can only take some
     * discrete values. For example, if valid values are `[10, 20, 30]` set the
     * `minValue` to `10`, the maxValue to `30`, and the step to `10`. If the
     * step is `0`, the any intermediate value is valid.
     */
    "prop:step"?:  number;

    /**
     * The value of the control.
     */
    "prop:value"?:  number;
  };

  export type ChSmartGrid = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.
     */
    "prop:accessibleName"?:  string;

    /**
     * When `true`, the control size grows automatically to fit its content
     * (no scrollbars). When `false`, the control has a fixed size and
     * shows scrollbars if the content overflows.
     * 
     * When `false`, the `ch-scrollable` class is applied to the host,
     * enabling `contain: strict` and `overflow: auto`.
     * 
     * Interacts with `inverseLoading`: when both `autoGrow` and
     * `inverseLoading` are `true`, the CLS-avoidance opacity class is
     * removed after the first render instead of waiting for the
     * virtual-scroller load event.
     */
    "prop:autoGrow"?:  boolean;

    /**
     * Specifies how the scroll position will be adjusted when the content size
     * changes when using `inverseLoading = true`.
     *   - "at-scroll-end": If the scroll is positioned at the end of the content,
     *   the chat will maintain the scroll at the end while the content size
     *   changes.
     * 
     *  - "never": The scroll position won't be adjusted when the content size
     *   changes.
     */
    "prop:autoScroll"?:  "never" | "at-scroll-end";

    /**
     * `true` if the control has an external data provider and therefore must
     * implement infinite scrolling to load data progressively.
     * When `true`, a `ch-infinite-scroll` element is rendered at the top
     * (if `inverseLoading`) or bottom of the grid content.
     */
    "prop:dataProvider"?:  boolean;

    /**
     * When set to `true`, the grid items will be loaded in inverse order, with
     * the first element at the bottom and the "Loading" message (infinite-scroll)
     * at the top.
     */
    "prop:inverseLoading"?:  boolean;

    /**
     * The current number of items (rows/cells) in the grid.
     * This is a required property used to trigger re-renders whenever the
     * data set changes. When `itemsCount` is `0`, the `grid-content-empty`
     * slot is rendered instead of `grid-content`.
     * 
     * If not specified, grid empty and loading placeholders may not work
     * correctly.
     */
    "prop:itemsCount"?:  number;

    /**
     * Specifies the loading state of the grid:
     *  - `"initial"`: First load; shows the `grid-initial-loading-placeholder`
     *    slot.
     *  - `"loading"`: Data is being fetched (infinite scroll triggered). The
     *    `ch-infinite-scroll` component shows its loading indicator.
     *  - `"loaded"`: Data fetch is complete. Normal content is rendered.
     * 
     * This property is mutable: the component sets it to `"loading"` when
     * the infinite-scroll threshold is reached.
     */
    "prop:loadingState"?:  SmartGridDataState;

    /**
     * The threshold distance from the bottom of the content to call the
     * `infinite` output event when scrolled. The threshold value can be either a
     * percent, or in pixels. For example, use the value of `10%` for the
     * `infinite` output event to get called when the user has scrolled 10% from
     * the bottom of the page. Use the value `100px` when the scroll is within
     * 100 pixels from the bottom of the page.
     */
    "prop:threshold"?:  string;
  };

  export type ChSwitch = {
    /**
     * Specifies a short string, typically 1 to 3 words, that authors associate
     * with an element to provide users of assistive technologies with a label
     * for the element.asd123
     */
    "prop:accessibleName"?: 
      | string
      | undefined;

    /**
     * Caption displayed when the switch is 'on'
     */
    "prop:checkedCaption"?: 
      | string
      | undefined;

    /**
     * `true` if the `ch-switch` is checked.
     * 
     * If checked:
     *   - The `value` property will be available in the parent `<form>` if the
     *     `name` attribute is set.
     *   - The `checkedCaption` will be used to display the current caption.
     * 
     * If not checked:
     *   - The `value` property won't be available in the parent `<form>`, even
     *     if the `name` attribute is set.
     *   - The `unCheckedCaption` will be used to display the current caption.
     */
    "prop:checked"?:  boolean;

    /**
     * This attribute lets you specify if the element is disabled.
     * If disabled, it will not fire any user interaction related event
     * (for example, click event).
     */
    "prop:disabled"?:  boolean;

    /**
     * Specifies the `name` of the component when used in a form.
     */
    "prop:name"?:  string | undefined;

    /**
     * This attribute indicates that the user cannot modify the value of the control.
     * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
     * attribute for `input` elements.
     */
    "prop:readonly"?:  boolean;

    /**
     * Caption displayed when the switch is 'off'
     */
    "prop:unCheckedCaption"?: 
      | string
      | undefined;

    /**
     * The value of the control.
     */
    "prop:value"?:  string;
  };

  export type ChTabularGridColumn = {
    /**
     * ...
     */
    "prop:accessibleName"?:  string | undefined;

    /**
     * Specifies the caption of the column
     */
    "prop:caption"?:  string | undefined;

    /**
     * Specifies the column span value of the column.
     */
    "prop:colSpan"?:  number | undefined;

    /**
     * Specifies the start position of the column.
     */
    "prop:colStart"?:  number | undefined;

    /**
     * ...
     */
    "prop:parts"?:  string | undefined;

    /**
     * ...
     */
    "prop:resizable"?:  boolean | undefined;

    /**
     * Specifies the row span value of the column.
     */
    "prop:rowSpan"?:  number | undefined;

    /**
     * ...
     */
    "prop:size"?:  string | undefined;

    /**
     * Specifies an accessor for the attribute style of the
     * `ch-tabular-grid-column`. This accessor is useful for SSR scenarios were
     * the Host access is limited (since Lit does not provide the Host
     * declarative component).
     * 
     * Without this accessor, the initial load in SSR scenarios would flicker.
     */
    "prop:styles"?:  string | undefined;

    /**
     * ...
     */
    "prop:sortable"?:  boolean | undefined;

    /**
     * Specifies if the column content is sorted.
     */
    "prop:sortDirection"?: 
      | TabularGridSortDirection
      | undefined;
  };

  export type ChTabularGridRender = {
    /**
     * Determines if the columns can be hidden by the user
     */
    "prop:columnHideable"?:  boolean;

    /**
     * Determines if the columns can be resized by the user.
     */
    "prop:columnResizable"?:  boolean;

    /**
     * Determines if the columns can be sorted by the user.
     */
    "prop:columnSortable"?:  boolean;

    /**
     * Specifies the content of the tabular grid control.
     */
    "prop:model"?:  TabularGridModel | undefined;
  };

  export type ChTextBlock = {
    /**
     * This property defines if the control size will grow automatically, to
     * adjust to its content size.
     * 
     * If `false` the overflowing content will be displayed with an ellipsis.
     * This ellipsis takes into account multiple lines.
     */
    "prop:autoGrow"?:  boolean;

    /**
     * Specifies the content to be displayed when the control has `format = text`.
     */
    "prop:caption"?:  string | undefined;

    /**
     * Specifies the character used to measure the line height
     */
    "prop:characterToMeasureLineHeight"?:  string;

    /**
     * It specifies the format that will have the textblock control.
     * 
     *  - If `format` = `HTML`, the textblock control works as an HTML div and
     *    the innerHTML will be taken from the default slot.
     * 
     *  - If `format` = `text`, the control works as a normal textblock control
     *    and it is affected by most of the defined properties.
     */
    "prop:format"?:  "text" | "HTML";

    /**
     * `true` to display a tooltip when the caption overflows the size of the
     * container.
     * 
     * Only works if `format = text` and `autoGrow = false`.
     */
    "prop:showTooltipOnOverflow"?:  boolean;
  };

  export type ChTheme = {
    /**
     * Indicates whether the theme should be attached to the Document or
     * the ShadowRoot after loading.
     * The value can be overridden by the `attachStyleSheet` property of the model.
     */
    "prop:attachStyleSheets"?:  boolean;

    /**
     * `true` to visually hide the contents of the root node while the control's
     * style is not loaded.
     */
    "prop:avoidFlashOfUnstyledContent"?:  boolean;

    /**
     * Specifies an accessor for the attribute `hidden` of the `ch-theme`. This
     * accessor is useful for SSR scenarios were the DOM is shimmed and we don't
     * have access to is limited (since Lit does not provide the Host declarative
     * component), so we have to find a way to reflect the hidden property in the
     * `ch-theme` tag.
     * 
     * Without this accessor, the initial load in SSR scenarios would flicker.
     */
    "prop:hidden"?:  boolean;

    /**
     * Specify themes to load
     */
    "prop:model"?:  ThemeModel | undefined | null;

    /**
     * Specifies the time to wait for the requested theme to load.
     */
    "prop:timeout"?: any;
  };

  export type ChVirtualScroller = {
    /**
     * The number of extra elements to render above and below the current
     * container's viewport. A higher value reduces the chance of blank areas
     * during fast scrolling but increases DOM size.
     * 
     * The new value is used on the next scroll or resize update.
     */
    "prop:bufferAmount"?:  number;

    /**
     * Specifies an estimated count of items that fit in the viewport for the
     * initial render. Combined with `bufferAmount`, this determines how many
     * items are rendered before the first scroll event. A value that is too
     * low may cause visible blank space on initial load; a value that is too
     * high increases initial DOM size.
     * 
     * Defaults to `10`. Init-only — only used during the first render cycle.
     */
    "prop:initialRenderViewportItems"?:  number;

    /**
     * When set to `true`, the grid items will be loaded in inverse order, with
     * the scroll positioned at the bottom on the initial load.
     * 
     * If `mode="virtual-scroll"`, only the items at the start of the viewport
     * that are not visible will be removed from the DOM. The items at the end of
     * the viewport that are not visible will remain rendered to avoid flickering
     * issues.
     */
    "prop:inverseLoading"?:  boolean;

    /**
     * The array of items to be rendered in the `ch-smart-grid`. Each item must
     * have a unique `id` property used internally for virtual size tracking.
     * 
     * When a new array reference is assigned, the virtual scroller resets its
     * internal state (indexes, virtual sizes) and performs a fresh initial
     * render. For incremental additions, prefer the `addItems()` method to
     * avoid a full reset.
     * 
     * Setting to `undefined` or an empty array emits an empty
     * `virtualItemsChanged` event.
     */
    "prop:items"?:  SmartGridModel | undefined;

    /**
     * The total number of elements in the `items` array. Set this property when
     * you mutate the existing array (e.g., push/splice) without assigning a new
     * reference, so the virtual scroller knows the length has changed.
     * 
     * If `items` is reassigned as a new array reference, this property is not
     * needed since the `@Watch` on `items` will handle the reset.
     */
    "prop:itemsCount"?:  number;

    /**
     * Specifies how the control will behave.
     *   - "virtual-scroll": Only the items at the start of the viewport that are
     *   not visible will be removed from the DOM. The items at the end of the
     *   viewport that are not visible will remain rendered to avoid flickering
     *   issues.
     * 
     *   - "lazy-render": It behaves similarly to "virtual-scroll" on the initial
     *   load, but when the user scrolls and new items are rendered, those items
     *   that are outside of the viewport won't be removed from the DOM.
     */
    "prop:mode"?:  "virtual-scroll" | "lazy-render";
  };
}

/**
 * Each interface contains the events of the custom elements of the library.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComponentEvents {
  export type ChBreadCrumbRender = {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    buttonClick?: (event: HTMLChBreadCrumbRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    hyperlinkClick?: (event: HTMLChBreadCrumbRenderElementHyperlinkClickEvent) => void;
  };

  export type ChChat = {
    /**
     * 
     */
    userMessageAdded?: (event: HTMLChChatElementUserMessageAddedEvent) => void;
  };

  export type ChCheckbox = {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     */
    input?: (event: HTMLChCheckboxElementInputEvent) => void;
  };

  export type ChEdit = {
    /**
     * 
     */
    change?: (event: HTMLChEditElementChangeEvent) => void;

    /**
     * 
     */
    input?: (event: HTMLChEditElementInputEvent) => void;

    /**
     * 
     */
    passwordVisibilityChange?: (event: HTMLChEditElementPasswordVisibilityChangeEvent) => void;
  };

  export type ChNavigationListRender = {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    buttonClick?: (event: HTMLChNavigationListRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    hyperlinkClick?: (event: HTMLChNavigationListRenderElementHyperlinkClickEvent) => void;
  };

  export type ChComponentRender = {
    /**
     * 
     */
    modelUpdate?: (event: HTMLChComponentRenderElementModelUpdateEvent) => void;
  };

  export type ChRadioGroupRender = {
    /**
     * Fired when the selected item change. It contains the information about the
     * new selected value.
     */
    change?: (event: HTMLChRadioGroupRenderElementChangeEvent) => void;
  };

  export type ChSidebar = {
    /**
     * Emitted when thea element is clicked or the space key is pressed and
     * released.
     */
    expandedChange?: (event: HTMLChSidebarElementExpandedChangeEvent) => void;
  };

  export type ChSlider = {
    /**
     * The `change` event is emitted when a change to the element's value is
     * committed by the user.
     */
    change?: (event: HTMLChSliderElementChangeEvent) => void;

    /**
     * The `input` event is fired synchronously when the value is changed.
     */
    input?: (event: HTMLChSliderElementInputEvent) => void;
  };

  export type ChSmartGrid = {
    /**
     * Emitted every time the infinite-scroll threshold is reached.
     * The host should respond by fetching the next page of data and updating
     * `loadingState` back to `"loaded"` when done.
     * 
     * Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
     * Before emitting, the component automatically sets `loadingState` to
     * `"loading"`.
     */
    infiniteThresholdReached?: (event: HTMLChSmartGridElementInfiniteThresholdReachedEvent) => void;
  };

  export type ChSwitch = {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     * 
     * This event is preventable.
     */
    input?: (event: HTMLChSwitchElementInputEvent) => void;
  };

  export type ChTheme = {
    /**
     * Event emitted when the theme has successfully loaded
     */
    themeLoaded?: (event: HTMLChThemeElementThemeLoadedEvent) => void;
  };

  export type ChVirtualScroller = {
    /**
     * Emitted when the slice of visible items changes due to scrolling, resizing,
     * or programmatic updates. The payload includes `startIndex`, `endIndex`,
     * `totalItems`, and the `virtualItems` sub-array that should be rendered.
     * 
     * This event is the primary mechanism for the parent `ch-smart-grid` to know
     * which cells to render.
     */
    virtualItemsChanged?: (event: HTMLChVirtualScrollerElementVirtualItemsChangedEvent) => void;

    /**
     * Fired once when all cells in the initial viewport have been rendered and
     * are visible. After this event, the scroller removes `opacity: 0` and
     * starts listening for scroll/resize events. This event has no payload.
     */
    virtualScrollerDidLoad?: (event: HTMLChVirtualScrollerElementVirtualScrollerDidLoadEvent) => void;
  };
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                  Types for JSX templates
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace LocalJSX {
  export type ChBeautifulMermaid = ComponentProperties.ChBeautifulMermaid;

  export type ChBreadCrumbRender = ComponentProperties.ChBreadCrumbRender & {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    onButtonClick?: (event: HTMLChBreadCrumbRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    onHyperlinkClick?: (event: HTMLChBreadCrumbRenderElementHyperlinkClickEvent) => void;
  };

  export type ChBreadCrumbItem = ComponentProperties.ChBreadCrumbItem;

  export type ChChat = ComponentProperties.ChChat & {
    /**
     * 
     */
    onUserMessageAdded?: (event: HTMLChChatElementUserMessageAddedEvent) => void;
  };

  export type ChChatRenderLit = ComponentProperties.ChChatRenderLit;

  export type ChCheckbox = ComponentProperties.ChCheckbox & {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     */
    onInput?: (event: HTMLChCheckboxElementInputEvent) => void;
  };

  export type ChCode = ComponentProperties.ChCode;

  export type ChEdit = ComponentProperties.ChEdit & {
    /**
     * 
     */
    onChange?: (event: HTMLChEditElementChangeEvent) => void;

    /**
     * 
     */
    onInput?: (event: HTMLChEditElementInputEvent) => void;

    /**
     * 
     */
    onPasswordVisibilityChange?: (event: HTMLChEditElementPasswordVisibilityChangeEvent) => void;
  };

  export type ChImage = ComponentProperties.ChImage;

  export type ChLayoutSplitter = ComponentProperties.ChLayoutSplitter;

  export type ChMarkdownViewer = ComponentProperties.ChMarkdownViewer;

  export type ChNavigationListItem = ComponentProperties.ChNavigationListItem;

  export type ChNavigationListRender = ComponentProperties.ChNavigationListRender & {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    onButtonClick?: (event: HTMLChNavigationListRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    onHyperlinkClick?: (event: HTMLChNavigationListRenderElementHyperlinkClickEvent) => void;
  };

  export type ChPerformanceScanItem = ComponentProperties.ChPerformanceScanItem;

  export type ChPerformanceScan = ComponentProperties.ChPerformanceScan;

  export type ChComponentRender = ComponentProperties.ChComponentRender & {
    /**
     * 
     */
    onModelUpdate?: (event: HTMLChComponentRenderElementModelUpdateEvent) => void;
  };

  export type ChPlaygroundEditor = ComponentProperties.ChPlaygroundEditor;

  export type ChProgress = ComponentProperties.ChProgress;

  export type ChQr = ComponentProperties.ChQr;

  export type ChRadioGroupRender = ComponentProperties.ChRadioGroupRender & {
    /**
     * Fired when the selected item change. It contains the information about the
     * new selected value.
     */
    onChange?: (event: HTMLChRadioGroupRenderElementChangeEvent) => void;
  };

  export type ChRouter = ComponentProperties.ChRouter;

  export type ChSegmentedControlItem = ComponentProperties.ChSegmentedControlItem;

  export type ChSegmentedControlRender = ComponentProperties.ChSegmentedControlRender;

  export type ChShowcaseApi = ComponentProperties.ChShowcaseApi;

  export type ChSidebar = ComponentProperties.ChSidebar & {
    /**
     * Emitted when thea element is clicked or the space key is pressed and
     * released.
     */
    onExpandedChange?: (event: HTMLChSidebarElementExpandedChangeEvent) => void;
  };

  export type ChSlider = ComponentProperties.ChSlider & {
    /**
     * The `change` event is emitted when a change to the element's value is
     * committed by the user.
     */
    onChange?: (event: HTMLChSliderElementChangeEvent) => void;

    /**
     * The `input` event is fired synchronously when the value is changed.
     */
    onInput?: (event: HTMLChSliderElementInputEvent) => void;
  };

  export type ChSmartGrid = ComponentProperties.ChSmartGrid & {
    /**
     * Emitted every time the infinite-scroll threshold is reached.
     * The host should respond by fetching the next page of data and updating
     * `loadingState` back to `"loaded"` when done.
     * 
     * Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
     * Before emitting, the component automatically sets `loadingState` to
     * `"loading"`.
     */
    onInfiniteThresholdReached?: (event: HTMLChSmartGridElementInfiniteThresholdReachedEvent) => void;
  };

  export type ChSwitch = ComponentProperties.ChSwitch & {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     * 
     * This event is preventable.
     */
    onInput?: (event: HTMLChSwitchElementInputEvent) => void;
  };

  export type ChTabularGridColumn = ComponentProperties.ChTabularGridColumn;

  export type ChTabularGridRender = ComponentProperties.ChTabularGridRender;

  export type ChTextBlock = ComponentProperties.ChTextBlock;

  export type ChTheme = ComponentProperties.ChTheme & {
    /**
     * Event emitted when the theme has successfully loaded
     */
    onThemeLoaded?: (event: HTMLChThemeElementThemeLoadedEvent) => void;
  };

  export type ChVirtualScroller = ComponentProperties.ChVirtualScroller & {
    /**
     * Emitted when the slice of visible items changes due to scrolling, resizing,
     * or programmatic updates. The payload includes `startIndex`, `endIndex`,
     * `totalItems`, and the `virtualItems` sub-array that should be rendered.
     * 
     * This event is the primary mechanism for the parent `ch-smart-grid` to know
     * which cells to render.
     */
    onVirtualItemsChanged?: (event: HTMLChVirtualScrollerElementVirtualItemsChangedEvent) => void;

    /**
     * Fired once when all cells in the initial viewport have been rendered and
     * are visible. After this event, the scroller removes `opacity: 0` and
     * starts listening for scroll/resize events. This event has no payload.
     */
    onVirtualScrollerDidLoad?: (event: HTMLChVirtualScrollerElementVirtualScrollerDidLoadEvent) => void;
  };
  
  interface IntrinsicElements {
    /**
     * @status developer-preview
     */
    "ch-beautiful-mermaid": ChBeautifulMermaid;
    
    /**
     * @status experimental
     *
     * This component needs to be hydrated to properly work. If not hydrated, the
     * component visibility will be hidden.
     *
     * @fires `buttonClick` Fired when an button is clicked.
     *   This event can be prevented.
     * @fires `hyperlinkClick` Fired when an hyperlink is clicked.
     *   This event can be prevented.
     */
    
    "ch-breadcrumb-render": ChBreadCrumbRender;
    
    /**
     * @status experimental
     */
    "ch-breadcrumb-item": ChBreadCrumbItem;
    
    /**
     * The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.
     *
     * @remarks
     * ## Features
     *  - Text messaging with file uploads and markdown rendering.
     *  - Real-time voice conversations via LiveKit integration.
     *  - Virtual scrolling for large message histories with configurable buffer size.
     *  - Auto-scrolling behavior configurable as `"at-scroll-end"` or `"never"`.
     *  - Fully customizable send-container layout with four slot positions.
     *  - Programmatic message management: add, update, and send messages via public methods.
     *  - Custom rendering of chat items through flexible render callbacks.
     *  - Stop-response button for cancelling assistant response generation.
     *
     * ## Use when
     *  - Building AI-powered chat or assistant interfaces.
     *  - Implementing conversational UIs with file attachment and voice support.
     *  - Building AI-powered conversational interfaces where the interaction model is back-and-forth dialogue.
     *  - The system needs to ask clarifying questions or produce streaming responses.
     *
     * ## Do not use when
     *  - Displaying a simple message list without interactivity — use `ch-smart-grid` instead.
     *  - A standard form would be faster and more precise for collecting structured data (e.g., address forms).
     *  - Displaying a simple non-interactive message list — prefer `ch-smart-grid` directly.
     *
     * ## Accessibility
     *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable for assistive technology during virtual scrolling.
     *  - The send button and stop-response button carry accessible labels via the `translations` property.
     *  - New messages should be announced to screen readers via `aria-live="polite"` on the messages container.
     *  - All action buttons (send, stop-response) must have descriptive labels via the `translations` property.
     *  - Color and alignment alone must not be the only way to distinguish user messages from AI messages.
     *
     * @status experimental
     *
     * @part messages-container - The scrollable container that holds the chat messages.
     * @part send-container - The bottom area containing the input and action buttons.
     * @part send-container-before - Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.
     * @part send-container-after - Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.
     * @part send-input-before - Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.
     * @part send-input-after - Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.
     * @part send-button - The button that sends the current message.
     * @part stop-response-button - The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided.
     *
     * @slot empty-chat - Displayed when all records are loaded but there are no messages.
     * @slot loading-chat - Displayed while the chat is in the initial loading state.
     * @slot additional-content - Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state.
     *
     * @fires `userMessageAdded` undefined
     */
    
    "ch-chat": ChChat;
    
    
    "ch-chat-render-lit": ChChatRenderLit;
    
    /**
     * @status developer-preview
     *
     * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.
     * @csspart input - The input element that implements the interactions for the component.
     * @csspart label - The label that is rendered when the `caption` property is not empty.
     *
     * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).
     * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).
     * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).
     * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).
    
     * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.
     *
     * @cssprop [--ch-checkbox__checked-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")] - Specifies the image of the checkbox when is checked.
     *
     * @cssprop [--ch-checkbox__option-indeterminate-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>")] - Specifies the image of the checkbox when is indeterminate.
     *
     * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.
     *
     * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.
     * 
     * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.
     *
     * @fires `input` The `input` event is emitted when a change to the element's checked state
     *   is committed by the user.
     *   
     *   It contains the new checked state of the control.
     */
    
    "ch-checkbox": ChCheckbox;
    
    /**
     * A control to highlight code blocks.
     * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.
     *
     * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).
     *
     * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
     */
    "ch-code": ChCode;
    
    /**
     * A wrapper for the input and textarea elements. It additionally provides:
     *  - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.
     *  - An action button.
     *  - Useful style resets.
     *  - Support for picture formatting.
     *  - Support to auto grow the control when used with multiline (useful to
     *    model chat inputs).
     *  - An image which can have multiple states.
     *  - Support for debouncing the input event.
     *
     * @part date-placeholder - A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" | "date" | "time"`.
     *
     * @slot additional-content-before - The slot used for the additional content when `showAdditionalContentBefore === true`.
     * @slot additional-content-after - The slot used for the additional content when `showAdditionalContentAfter === true`.
     *
     * @fires `change` undefined
     * @fires `input` undefined
     * @fires `passwordVisibilityChange` undefined
     */
    
    "ch-edit": ChEdit;
    
    /**
     * A control to display multiple images, depending on the state (focus, hover,
     * active or disabled) of a parent element.
     */
    "ch-image": ChImage;
    
    /**
     * This component allows us to design a layout composed by columns and rows.
     *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.
     *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.
     *
     * @csspart bar - The bar that divides two columns or two rows
     */
    "ch-layout-splitter": ChLayoutSplitter;
    
    
    "ch-markdown-viewer": ChMarkdownViewer;
    
    /**
     * @status experimental
     */
    "ch-navigation-list-item": ChNavigationListItem;
    
    /**
     * @status experimental
     *
     * This component needs to be hydrated to properly work. If not hydrated, the
     * component visibility will be hidden.
     *
     * @fires `buttonClick` Fired when an button is clicked.
     *   This event can be prevented.
     * @fires `hyperlinkClick` Fired when an hyperlink is clicked.
     *   This event can be prevented.
     */
    
    "ch-navigation-list-render": ChNavigationListRender;
    
    /**
     * @status experimental
     */
    "ch-performance-scan-item": ChPerformanceScanItem;
    
    /**
     * A component to visualize re-renders on Lit components.
     * @status experimental
     */
    "ch-performance-scan": ChPerformanceScan;
    
    /**
     * @fires modelUpdate
     *
     * @fires `modelUpdate` undefined
     */
    
    "ch-component-render": ChComponentRender;
    
    
    "ch-playground-editor": ChPlaygroundEditor;
    
    /**
     * The ch-progress is an element that displays the progress status for tasks
     * that take a long time.
     *
     * It implements all accessibility behaviors for determinate and indeterminate
     * progress. It also supports referencing a region to describe its progress.
     *
     * @status experimental
     */
    "ch-progress": ChProgress;
    
    /**
     * @status developer-preview
     */
    "ch-qr": ChQr;
    
    /**
     * The radio group control is used to render a short list of mutually exclusive options.
     *
     * It contains radio items to allow users to select one option from the list of options.
     *
     * @part radio__item - The radio item element.
     * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
     * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
     * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
     * @part radio__label - The label that is rendered when the `caption` property is not empty.
     *
     * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
     * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
     * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
     *
     * @fires `change` Fired when the selected item change. It contains the information about the
     *   new selected value.
     */
    
    "ch-radio-group-render": ChRadioGroupRender;
    
    /**
     * @status developer-preview
     */
    "ch-router": ChRouter;
    
    /**
     * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
     * This control represents and item of the ch-segmented-control-render
     *
     * @part selected - ...
     */
    "ch-segmented-control-item": ChSegmentedControlItem;
    
    /**
     * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
     */
    "ch-segmented-control-render": ChSegmentedControlRender;
    
    
    "ch-showcase-api": ChShowcaseApi;
    
    /**
     * @fires `expandedChange` Emitted when thea element is clicked or the space key is pressed and
     *   released.
     */
    
    "ch-sidebar": ChSidebar;
    
    /**
     * The slider control is a input where the user selects a value from within a given range.
     *
     * @part track - The track of the slider element.
     * @part thumb - The thumb of the slider element.
     *
     * @part track__selected - Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.
     * @part track__unselected - Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.
     *
     * @part disabled - Present in all parts when the control is disabled (`disabled` === `true`).
     *
     * @fires `change` The `change` event is emitted when a change to the element's value is
     *   committed by the user.
     * @fires `input` The `input` event is fired synchronously when the value is changed.
     */
    
    "ch-slider": ChSlider;
    
    /**
     * The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.
     *
     * @remarks
     * ## Features
     *  - Infinite scrolling via `ch-infinite-scroll` integration with configurable thresholds.
     *  - Standard and inverse loading orders (newest items at the bottom or top).
     *  - Automatic scroll-position management to prevent layout shifts (CLS) during async content loads.
     *  - Anchor a specific cell at the top of the viewport with reserved space, similar to code editors (via `scrollEndContentToPosition`).
     *  - Auto-grow mode (`autoGrow`) to adjust size to content, or fixed size with scrollbars.
     *  - ARIA live-region support for accessible announcements.
     *  - Virtual-scroller integration for rendering only visible items.
     *
     * ## Use when
     *  - Building chat-like interfaces with inverse loading.
     *  - Displaying large, dynamically loaded data sets with virtual scrolling.
     *  - Infinite-scroll or paginated feeds with bottom-to-top inverse loading (e.g., chat, activity streams).
     *
     * ## Do not use when
     *  - Displaying static tabular data with columns and headers -- use `ch-tabular-grid` instead.
     *  - A fixed, non-scrollable list is sufficient -- prefer `ch-action-list-render`.
     *
     * ## Accessibility
     *  - The host element uses `aria-live="polite"` to announce content changes to assistive technologies.
     *  - `aria-busy` is set to `"true"` during `"initial"` and `"loading"` states, preventing premature announcements.
     *  - The `accessibleName` property maps to `aria-label` on the host.
     *
     * @status experimental
     *
     * @slot grid-initial-loading-placeholder - Placeholder content shown during the initial loading state before any data has been fetched.
     * @slot grid-content - Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.
     * @slot grid-content-empty - Fallback content displayed when the grid has finished loading but contains no records.
     *
     * @fires `infiniteThresholdReached` Emitted every time the infinite-scroll threshold is reached.
     *   The host should respond by fetching the next page of data and updating
     *   `loadingState` back to `"loaded"` when done.
     *   
     *   Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
     *   Before emitting, the component automatically sets `loadingState` to
     *   `"loading"`.
     */
    
    "ch-smart-grid": ChSmartGrid;
    
    /**
     * @status experimental
     *
     * A switch/toggle control that enables you to select between options.
     *
     * @part track - The track of the switch element.
     * @part thumb - The thumb of the switch element.
     * @part caption - The caption (checked or unchecked) of the switch element.
     *
     * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).
     * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).
     * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).
     *
     * @fires `input` The `input` event is emitted when a change to the element's checked state
     *   is committed by the user.
     *   
     *   It contains the new checked state of the control.
     *   
     *   This event is preventable.
     */
    
    "ch-switch": ChSwitch;
    
    
    "ch-tabular-grid-column": ChTabularGridColumn;
    
    
    "ch-tabular-grid-render": ChTabularGridRender;
    
    /**
     * @status developer-preview
     *
     * @slot - The slot for the HTML content.
     */
    "ch-textblock": ChTextBlock;
    
    /**
     * It allows you to load a style sheet in a similar way to the
     * native LINK or STYLE tags, but assigning it a name so that
     * it can be reused in different contexts,
     * either in the Document or in a Shadow-Root.
     *
     * @fires `themeLoaded` Event emitted when the theme has successfully loaded
     */
    
    "ch-theme": ChTheme;
    
    /**
     * The `ch-virtual-scroller` component provides efficient virtual scrolling for large lists of items within a `ch-smart-grid`, keeping only visible items plus a configurable buffer in the DOM.
     *
     * @remarks
     * ## Features
     *  - `"virtual-scroll"` mode: removes items outside the viewport from the DOM, using CSS pseudo-element spacers (`::before` / `::after`) to maintain scroll height. Lowest memory footprint.
     *  - `"lazy-render"` mode: lazily renders items as they scroll into view, but keeps them in the DOM once rendered. Avoids re-rendering costs at the expense of higher memory usage.
     *  - Configurable buffer amount (`bufferAmount`) for items rendered above and below the viewport.
     *  - Inverse loading support (`inverseLoading`) for chat-style interfaces where the newest items are at the bottom and the scroll starts at the end.
     *  - Automatic re-rendering on scroll and resize events via `requestAnimationFrame`-synced updates.
     *  - Emits `virtualItemsChanged` whenever the visible slice changes, enabling the parent to render only the required cells.
     *  - Hides content with `opacity: 0` until the initial viewport cells are fully loaded, then fires `virtualScrollerDidLoad`.
     *
     * ## Use when
     *  - Rendering hundreds or thousands of items inside a `ch-smart-grid`.
     *  - Building chat interfaces that need efficient inverse-loaded virtual scrolling.
     *
     * ## Do not use when
     *  - The list has fewer than ~100 items — the overhead of virtual scrolling is not justified.
     *  - Used outside of `ch-smart-grid` — this component is designed to work exclusively with `ch-smart-grid`.
     *
     * ## Accessibility
     *  - This component is structural and does not render visible interactive content. Accessibility semantics are handled by the parent `ch-smart-grid` and its cells.
     *
     * ```
     *   <ch-smart-grid>
     *     #shadow-root (open)
     *     |  <slot name="grid-content"></slot>
     *     <ch-virtual-scroller slot="grid-content">
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       ...
     *     </ch-virtual-scroller>
     *   </ch-smart-grid>
     * ```
     *
     * @status experimental
     *
     * @slot - Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled.
     *
     *
     * @fires `virtualItemsChanged` Emitted when the slice of visible items changes due to scrolling, resizing,
     *   or programmatic updates. The payload includes `startIndex`, `endIndex`,
     *   `totalItems`, and the `virtualItems` sub-array that should be rendered.
     *   
     *   This event is the primary mechanism for the parent `ch-smart-grid` to know
     *   which cells to render.
     * @fires `virtualScrollerDidLoad` Fired once when all cells in the initial viewport have been rendered and
     *   are visible. After this event, the scroller removes `opacity: 0` and
     *   starts listening for scroll/resize events. This event has no payload.
     */
    
    "ch-virtual-scroller": ChVirtualScroller;
  }
}
  
export type { LocalJSX as JSX };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                Types for SolidJS templates
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace SolidJsJSX {
  export type ChBeautifulMermaid = ComponentPropertiesSolidJS.ChBeautifulMermaid;

  export type ChBreadCrumbRender = ComponentPropertiesSolidJS.ChBreadCrumbRender & {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    "on:buttonClick"?: (event: HTMLChBreadCrumbRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    "on:hyperlinkClick"?: (event: HTMLChBreadCrumbRenderElementHyperlinkClickEvent) => void;
  };

  export type ChBreadCrumbItem = ComponentPropertiesSolidJS.ChBreadCrumbItem;

  export type ChChat = ComponentPropertiesSolidJS.ChChat & {
    /**
     * 
     */
    "on:userMessageAdded"?: (event: HTMLChChatElementUserMessageAddedEvent) => void;
  };

  export type ChChatRenderLit = ComponentPropertiesSolidJS.ChChatRenderLit;

  export type ChCheckbox = ComponentPropertiesSolidJS.ChCheckbox & {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     */
    "on:input"?: (event: HTMLChCheckboxElementInputEvent) => void;
  };

  export type ChCode = ComponentPropertiesSolidJS.ChCode;

  export type ChEdit = ComponentPropertiesSolidJS.ChEdit & {
    /**
     * 
     */
    "on:change"?: (event: HTMLChEditElementChangeEvent) => void;

    /**
     * 
     */
    "on:input"?: (event: HTMLChEditElementInputEvent) => void;

    /**
     * 
     */
    "on:passwordVisibilityChange"?: (event: HTMLChEditElementPasswordVisibilityChangeEvent) => void;
  };

  export type ChImage = ComponentPropertiesSolidJS.ChImage;

  export type ChLayoutSplitter = ComponentPropertiesSolidJS.ChLayoutSplitter;

  export type ChMarkdownViewer = ComponentPropertiesSolidJS.ChMarkdownViewer;

  export type ChNavigationListItem = ComponentPropertiesSolidJS.ChNavigationListItem;

  export type ChNavigationListRender = ComponentPropertiesSolidJS.ChNavigationListRender & {
    /**
     * Fired when an button is clicked.
     * This event can be prevented.
     */
    "on:buttonClick"?: (event: HTMLChNavigationListRenderElementButtonClickEvent) => void;

    /**
     * Fired when an hyperlink is clicked.
     * This event can be prevented.
     */
    "on:hyperlinkClick"?: (event: HTMLChNavigationListRenderElementHyperlinkClickEvent) => void;
  };

  export type ChPerformanceScanItem = ComponentPropertiesSolidJS.ChPerformanceScanItem;

  export type ChPerformanceScan = ComponentPropertiesSolidJS.ChPerformanceScan;

  export type ChComponentRender = ComponentPropertiesSolidJS.ChComponentRender & {
    /**
     * 
     */
    "on:modelUpdate"?: (event: HTMLChComponentRenderElementModelUpdateEvent) => void;
  };

  export type ChPlaygroundEditor = ComponentPropertiesSolidJS.ChPlaygroundEditor;

  export type ChProgress = ComponentPropertiesSolidJS.ChProgress;

  export type ChQr = ComponentPropertiesSolidJS.ChQr;

  export type ChRadioGroupRender = ComponentPropertiesSolidJS.ChRadioGroupRender & {
    /**
     * Fired when the selected item change. It contains the information about the
     * new selected value.
     */
    "on:change"?: (event: HTMLChRadioGroupRenderElementChangeEvent) => void;
  };

  export type ChRouter = ComponentPropertiesSolidJS.ChRouter;

  export type ChSegmentedControlItem = ComponentPropertiesSolidJS.ChSegmentedControlItem;

  export type ChSegmentedControlRender = ComponentPropertiesSolidJS.ChSegmentedControlRender;

  export type ChShowcaseApi = ComponentPropertiesSolidJS.ChShowcaseApi;

  export type ChSidebar = ComponentPropertiesSolidJS.ChSidebar & {
    /**
     * Emitted when thea element is clicked or the space key is pressed and
     * released.
     */
    "on:expandedChange"?: (event: HTMLChSidebarElementExpandedChangeEvent) => void;
  };

  export type ChSlider = ComponentPropertiesSolidJS.ChSlider & {
    /**
     * The `change` event is emitted when a change to the element's value is
     * committed by the user.
     */
    "on:change"?: (event: HTMLChSliderElementChangeEvent) => void;

    /**
     * The `input` event is fired synchronously when the value is changed.
     */
    "on:input"?: (event: HTMLChSliderElementInputEvent) => void;
  };

  export type ChSmartGrid = ComponentPropertiesSolidJS.ChSmartGrid & {
    /**
     * Emitted every time the infinite-scroll threshold is reached.
     * The host should respond by fetching the next page of data and updating
     * `loadingState` back to `"loaded"` when done.
     * 
     * Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
     * Before emitting, the component automatically sets `loadingState` to
     * `"loading"`.
     */
    "on:infiniteThresholdReached"?: (event: HTMLChSmartGridElementInfiniteThresholdReachedEvent) => void;
  };

  export type ChSwitch = ComponentPropertiesSolidJS.ChSwitch & {
    /**
     * The `input` event is emitted when a change to the element's checked state
     * is committed by the user.
     * 
     * It contains the new checked state of the control.
     * 
     * This event is preventable.
     */
    "on:input"?: (event: HTMLChSwitchElementInputEvent) => void;
  };

  export type ChTabularGridColumn = ComponentPropertiesSolidJS.ChTabularGridColumn;

  export type ChTabularGridRender = ComponentPropertiesSolidJS.ChTabularGridRender;

  export type ChTextBlock = ComponentPropertiesSolidJS.ChTextBlock;

  export type ChTheme = ComponentPropertiesSolidJS.ChTheme & {
    /**
     * Event emitted when the theme has successfully loaded
     */
    "on:themeLoaded"?: (event: HTMLChThemeElementThemeLoadedEvent) => void;
  };

  export type ChVirtualScroller = ComponentPropertiesSolidJS.ChVirtualScroller & {
    /**
     * Emitted when the slice of visible items changes due to scrolling, resizing,
     * or programmatic updates. The payload includes `startIndex`, `endIndex`,
     * `totalItems`, and the `virtualItems` sub-array that should be rendered.
     * 
     * This event is the primary mechanism for the parent `ch-smart-grid` to know
     * which cells to render.
     */
    "on:virtualItemsChanged"?: (event: HTMLChVirtualScrollerElementVirtualItemsChangedEvent) => void;

    /**
     * Fired once when all cells in the initial viewport have been rendered and
     * are visible. After this event, the scroller removes `opacity: 0` and
     * starts listening for scroll/resize events. This event has no payload.
     */
    "on:virtualScrollerDidLoad"?: (event: HTMLChVirtualScrollerElementVirtualScrollerDidLoadEvent) => void;
  };
  
  interface IntrinsicElements {
    /**
     * @status developer-preview
     */
    "ch-beautiful-mermaid": ChBeautifulMermaid;
    
    /**
     * @status experimental
     *
     * This component needs to be hydrated to properly work. If not hydrated, the
     * component visibility will be hidden.
     *
     * @fires `buttonClick` Fired when an button is clicked.
     *   This event can be prevented.
     * @fires `hyperlinkClick` Fired when an hyperlink is clicked.
     *   This event can be prevented.
     */
    
    "ch-breadcrumb-render": ChBreadCrumbRender;
    
    /**
     * @status experimental
     */
    "ch-breadcrumb-item": ChBreadCrumbItem;
    
    /**
     * The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.
     *
     * @remarks
     * ## Features
     *  - Text messaging with file uploads and markdown rendering.
     *  - Real-time voice conversations via LiveKit integration.
     *  - Virtual scrolling for large message histories with configurable buffer size.
     *  - Auto-scrolling behavior configurable as `"at-scroll-end"` or `"never"`.
     *  - Fully customizable send-container layout with four slot positions.
     *  - Programmatic message management: add, update, and send messages via public methods.
     *  - Custom rendering of chat items through flexible render callbacks.
     *  - Stop-response button for cancelling assistant response generation.
     *
     * ## Use when
     *  - Building AI-powered chat or assistant interfaces.
     *  - Implementing conversational UIs with file attachment and voice support.
     *  - Building AI-powered conversational interfaces where the interaction model is back-and-forth dialogue.
     *  - The system needs to ask clarifying questions or produce streaming responses.
     *
     * ## Do not use when
     *  - Displaying a simple message list without interactivity — use `ch-smart-grid` instead.
     *  - A standard form would be faster and more precise for collecting structured data (e.g., address forms).
     *  - Displaying a simple non-interactive message list — prefer `ch-smart-grid` directly.
     *
     * ## Accessibility
     *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable for assistive technology during virtual scrolling.
     *  - The send button and stop-response button carry accessible labels via the `translations` property.
     *  - New messages should be announced to screen readers via `aria-live="polite"` on the messages container.
     *  - All action buttons (send, stop-response) must have descriptive labels via the `translations` property.
     *  - Color and alignment alone must not be the only way to distinguish user messages from AI messages.
     *
     * @status experimental
     *
     * @part messages-container - The scrollable container that holds the chat messages.
     * @part send-container - The bottom area containing the input and action buttons.
     * @part send-container-before - Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.
     * @part send-container-after - Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.
     * @part send-input-before - Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.
     * @part send-input-after - Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.
     * @part send-button - The button that sends the current message.
     * @part stop-response-button - The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided.
     *
     * @slot empty-chat - Displayed when all records are loaded but there are no messages.
     * @slot loading-chat - Displayed while the chat is in the initial loading state.
     * @slot additional-content - Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state.
     *
     * @fires `userMessageAdded` undefined
     */
    
    "ch-chat": ChChat;
    
    
    "ch-chat-render-lit": ChChatRenderLit;
    
    /**
     * @status developer-preview
     *
     * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.
     * @csspart input - The input element that implements the interactions for the component.
     * @csspart label - The label that is rendered when the `caption` property is not empty.
     *
     * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).
     * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).
     * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).
     * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).
    
     * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.
     *
     * @cssprop [--ch-checkbox__checked-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")] - Specifies the image of the checkbox when is checked.
     *
     * @cssprop [--ch-checkbox__option-indeterminate-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>")] - Specifies the image of the checkbox when is indeterminate.
     *
     * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.
     *
     * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.
     * 
     * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.
     *
     * @fires `input` The `input` event is emitted when a change to the element's checked state
     *   is committed by the user.
     *   
     *   It contains the new checked state of the control.
     */
    
    "ch-checkbox": ChCheckbox;
    
    /**
     * A control to highlight code blocks.
     * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.
     *
     * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).
     *
     * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
     */
    "ch-code": ChCode;
    
    /**
     * A wrapper for the input and textarea elements. It additionally provides:
     *  - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.
     *  - An action button.
     *  - Useful style resets.
     *  - Support for picture formatting.
     *  - Support to auto grow the control when used with multiline (useful to
     *    model chat inputs).
     *  - An image which can have multiple states.
     *  - Support for debouncing the input event.
     *
     * @part date-placeholder - A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" | "date" | "time"`.
     *
     * @slot additional-content-before - The slot used for the additional content when `showAdditionalContentBefore === true`.
     * @slot additional-content-after - The slot used for the additional content when `showAdditionalContentAfter === true`.
     *
     * @fires `change` undefined
     * @fires `input` undefined
     * @fires `passwordVisibilityChange` undefined
     */
    
    "ch-edit": ChEdit;
    
    /**
     * A control to display multiple images, depending on the state (focus, hover,
     * active or disabled) of a parent element.
     */
    "ch-image": ChImage;
    
    /**
     * This component allows us to design a layout composed by columns and rows.
     *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.
     *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.
     *
     * @csspart bar - The bar that divides two columns or two rows
     */
    "ch-layout-splitter": ChLayoutSplitter;
    
    
    "ch-markdown-viewer": ChMarkdownViewer;
    
    /**
     * @status experimental
     */
    "ch-navigation-list-item": ChNavigationListItem;
    
    /**
     * @status experimental
     *
     * This component needs to be hydrated to properly work. If not hydrated, the
     * component visibility will be hidden.
     *
     * @fires `buttonClick` Fired when an button is clicked.
     *   This event can be prevented.
     * @fires `hyperlinkClick` Fired when an hyperlink is clicked.
     *   This event can be prevented.
     */
    
    "ch-navigation-list-render": ChNavigationListRender;
    
    /**
     * @status experimental
     */
    "ch-performance-scan-item": ChPerformanceScanItem;
    
    /**
     * A component to visualize re-renders on Lit components.
     * @status experimental
     */
    "ch-performance-scan": ChPerformanceScan;
    
    /**
     * @fires modelUpdate
     *
     * @fires `modelUpdate` undefined
     */
    
    "ch-component-render": ChComponentRender;
    
    
    "ch-playground-editor": ChPlaygroundEditor;
    
    /**
     * The ch-progress is an element that displays the progress status for tasks
     * that take a long time.
     *
     * It implements all accessibility behaviors for determinate and indeterminate
     * progress. It also supports referencing a region to describe its progress.
     *
     * @status experimental
     */
    "ch-progress": ChProgress;
    
    /**
     * @status developer-preview
     */
    "ch-qr": ChQr;
    
    /**
     * The radio group control is used to render a short list of mutually exclusive options.
     *
     * It contains radio items to allow users to select one option from the list of options.
     *
     * @part radio__item - The radio item element.
     * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
     * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
     * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
     * @part radio__label - The label that is rendered when the `caption` property is not empty.
     *
     * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
     * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
     * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
     *
     * @fires `change` Fired when the selected item change. It contains the information about the
     *   new selected value.
     */
    
    "ch-radio-group-render": ChRadioGroupRender;
    
    /**
     * @status developer-preview
     */
    "ch-router": ChRouter;
    
    /**
     * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
     * This control represents and item of the ch-segmented-control-render
     *
     * @part selected - ...
     */
    "ch-segmented-control-item": ChSegmentedControlItem;
    
    /**
     * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
     */
    "ch-segmented-control-render": ChSegmentedControlRender;
    
    
    "ch-showcase-api": ChShowcaseApi;
    
    /**
     * @fires `expandedChange` Emitted when thea element is clicked or the space key is pressed and
     *   released.
     */
    
    "ch-sidebar": ChSidebar;
    
    /**
     * The slider control is a input where the user selects a value from within a given range.
     *
     * @part track - The track of the slider element.
     * @part thumb - The thumb of the slider element.
     *
     * @part track__selected - Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.
     * @part track__unselected - Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.
     *
     * @part disabled - Present in all parts when the control is disabled (`disabled` === `true`).
     *
     * @fires `change` The `change` event is emitted when a change to the element's value is
     *   committed by the user.
     * @fires `input` The `input` event is fired synchronously when the value is changed.
     */
    
    "ch-slider": ChSlider;
    
    /**
     * The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.
     *
     * @remarks
     * ## Features
     *  - Infinite scrolling via `ch-infinite-scroll` integration with configurable thresholds.
     *  - Standard and inverse loading orders (newest items at the bottom or top).
     *  - Automatic scroll-position management to prevent layout shifts (CLS) during async content loads.
     *  - Anchor a specific cell at the top of the viewport with reserved space, similar to code editors (via `scrollEndContentToPosition`).
     *  - Auto-grow mode (`autoGrow`) to adjust size to content, or fixed size with scrollbars.
     *  - ARIA live-region support for accessible announcements.
     *  - Virtual-scroller integration for rendering only visible items.
     *
     * ## Use when
     *  - Building chat-like interfaces with inverse loading.
     *  - Displaying large, dynamically loaded data sets with virtual scrolling.
     *  - Infinite-scroll or paginated feeds with bottom-to-top inverse loading (e.g., chat, activity streams).
     *
     * ## Do not use when
     *  - Displaying static tabular data with columns and headers -- use `ch-tabular-grid` instead.
     *  - A fixed, non-scrollable list is sufficient -- prefer `ch-action-list-render`.
     *
     * ## Accessibility
     *  - The host element uses `aria-live="polite"` to announce content changes to assistive technologies.
     *  - `aria-busy` is set to `"true"` during `"initial"` and `"loading"` states, preventing premature announcements.
     *  - The `accessibleName` property maps to `aria-label` on the host.
     *
     * @status experimental
     *
     * @slot grid-initial-loading-placeholder - Placeholder content shown during the initial loading state before any data has been fetched.
     * @slot grid-content - Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.
     * @slot grid-content-empty - Fallback content displayed when the grid has finished loading but contains no records.
     *
     * @fires `infiniteThresholdReached` Emitted every time the infinite-scroll threshold is reached.
     *   The host should respond by fetching the next page of data and updating
     *   `loadingState` back to `"loaded"` when done.
     *   
     *   Does not bubble (`bubbles: false`). Not cancelable. Payload is `void`.
     *   Before emitting, the component automatically sets `loadingState` to
     *   `"loading"`.
     */
    
    "ch-smart-grid": ChSmartGrid;
    
    /**
     * @status experimental
     *
     * A switch/toggle control that enables you to select between options.
     *
     * @part track - The track of the switch element.
     * @part thumb - The thumb of the switch element.
     * @part caption - The caption (checked or unchecked) of the switch element.
     *
     * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).
     * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).
     * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).
     *
     * @fires `input` The `input` event is emitted when a change to the element's checked state
     *   is committed by the user.
     *   
     *   It contains the new checked state of the control.
     *   
     *   This event is preventable.
     */
    
    "ch-switch": ChSwitch;
    
    
    "ch-tabular-grid-column": ChTabularGridColumn;
    
    
    "ch-tabular-grid-render": ChTabularGridRender;
    
    /**
     * @status developer-preview
     *
     * @slot - The slot for the HTML content.
     */
    "ch-textblock": ChTextBlock;
    
    /**
     * It allows you to load a style sheet in a similar way to the
     * native LINK or STYLE tags, but assigning it a name so that
     * it can be reused in different contexts,
     * either in the Document or in a Shadow-Root.
     *
     * @fires `themeLoaded` Event emitted when the theme has successfully loaded
     */
    
    "ch-theme": ChTheme;
    
    /**
     * The `ch-virtual-scroller` component provides efficient virtual scrolling for large lists of items within a `ch-smart-grid`, keeping only visible items plus a configurable buffer in the DOM.
     *
     * @remarks
     * ## Features
     *  - `"virtual-scroll"` mode: removes items outside the viewport from the DOM, using CSS pseudo-element spacers (`::before` / `::after`) to maintain scroll height. Lowest memory footprint.
     *  - `"lazy-render"` mode: lazily renders items as they scroll into view, but keeps them in the DOM once rendered. Avoids re-rendering costs at the expense of higher memory usage.
     *  - Configurable buffer amount (`bufferAmount`) for items rendered above and below the viewport.
     *  - Inverse loading support (`inverseLoading`) for chat-style interfaces where the newest items are at the bottom and the scroll starts at the end.
     *  - Automatic re-rendering on scroll and resize events via `requestAnimationFrame`-synced updates.
     *  - Emits `virtualItemsChanged` whenever the visible slice changes, enabling the parent to render only the required cells.
     *  - Hides content with `opacity: 0` until the initial viewport cells are fully loaded, then fires `virtualScrollerDidLoad`.
     *
     * ## Use when
     *  - Rendering hundreds or thousands of items inside a `ch-smart-grid`.
     *  - Building chat interfaces that need efficient inverse-loaded virtual scrolling.
     *
     * ## Do not use when
     *  - The list has fewer than ~100 items — the overhead of virtual scrolling is not justified.
     *  - Used outside of `ch-smart-grid` — this component is designed to work exclusively with `ch-smart-grid`.
     *
     * ## Accessibility
     *  - This component is structural and does not render visible interactive content. Accessibility semantics are handled by the parent `ch-smart-grid` and its cells.
     *
     * ```
     *   <ch-smart-grid>
     *     #shadow-root (open)
     *     |  <slot name="grid-content"></slot>
     *     <ch-virtual-scroller slot="grid-content">
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       <ch-smart-grid-cell>...</ch-smart-grid-cell>
     *       ...
     *     </ch-virtual-scroller>
     *   </ch-smart-grid>
     * ```
     *
     * @status experimental
     *
     * @slot - Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled.
     *
     *
     * @fires `virtualItemsChanged` Emitted when the slice of visible items changes due to scrolling, resizing,
     *   or programmatic updates. The payload includes `startIndex`, `endIndex`,
     *   `totalItems`, and the `virtualItems` sub-array that should be rendered.
     *   
     *   This event is the primary mechanism for the parent `ch-smart-grid` to know
     *   which cells to render.
     * @fires `virtualScrollerDidLoad` Fired once when all cells in the initial viewport have been rendered and
     *   are visible. After this event, the scroller removes `opacity: 0` and
     *   starts listening for scroll/resize events. This event has no payload.
     */
    
    "ch-virtual-scroller": ChVirtualScroller;
  }
}

export type { SolidJsJSX };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//          Apply module types for React templates
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// @ts-expect-error This module exists in React applications
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//         Apply module types for SolidJS templates
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// @ts-expect-error This module exists in SolidJS applications
declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends SolidJsJSX.IntrinsicElements {}
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//        Apply module types for StencilJS templates
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// @ts-expect-error This module exists in StencilJS applications
declare module "@stencil/core" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}