const BASE_EXPORTPARTS =
  "tab,tab-caption,close-button,tab-list,tab-list-start,tab-list-end,tab-panel,tab-panel-container,img,closable,not-closable,disabled,dragging,dragging-over-tab-list,dragging-out-of-tab-list,expanded,collapsed,selected,not-selected,block,inline,start,end,droppable-area,leaf,bar";

export const FLEXIBLE_LAYOUT_RENDERED_CONTENT = (children: string) =>
  `<ch-flexible-layout exportparts="${BASE_EXPORTPARTS}" class="hydrated">${children}</ch-flexible-layout>`;

export const FLEXIBLE_LAYOUT_RENDERED_CONTENT_TABBED = (
  children: string,
  tabbedItemId: string,
  tabListPosition: string,
  widgetIds: string[]
) => {
  const additionalParts = [tabbedItemId, tabListPosition, ...widgetIds].join(
    ","
  );
  return `<ch-flexible-layout exportparts="${BASE_EXPORTPARTS},${additionalParts}" class="hydrated">${children}</ch-flexible-layout>`;
};

export const SLOT_CONTENT = (id: string) =>
  `<slot name="${id}" slot="${id}"></slot>`;
