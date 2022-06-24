import { Component, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-paginator",
  styleUrl: "ch-paginator.scss",
  shadow: false,
})
export class ChPaginator {
  @Event() activePageChanged: EventEmitter<ChPaginatorActivePageChangedEvent>;
}

export interface ChPaginatorActivePageChangedEvent {
  page: number;
}
