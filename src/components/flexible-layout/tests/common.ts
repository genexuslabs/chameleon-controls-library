export const FLEXIBLE_LAYOUT_RENDERED_CONTENT = (children: string) =>
  `<ch-flexible-layout exportparts="tab,tab-caption,close-button,tab-list,tab-list-start,tab-list-end,tab-panel,tab-panel-container,img,closable,not-closable,disabled,dragging,dragging-over-tab-list,dragging-out-of-tab-list,expanded,collapsed,selected,not-selected,block,inline,start,end,droppable-area,leaf,bar" class="hydrated">${children}</ch-flexible-layout>`;

export const SLOT_CONTENT = (id: string) =>
  `<slot name="${id}" slot="${id}"></slot>`;
