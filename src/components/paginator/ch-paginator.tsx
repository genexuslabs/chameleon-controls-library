/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Event, EventEmitter, Listen, Prop } from "@stencil/core";
import { ChPaginatorNavigationClickedEvent } from "../paginator-navigate/ch-paginator-navigate-types";

@Component({
  tag: "ch-paginator",
  styleUrl: "ch-paginator.scss",
  shadow: false
})
export class ChPaginator {
  @Prop() readonly activePage: number;
  @Prop() readonly totalPages: number;
  @Event() activePageChanged: EventEmitter<ChPaginatorActivePageChangedEvent>;

  @Listen("navigationClicked")
  navigationClickedHandler(
    _eventInfo: CustomEvent<ChPaginatorNavigationClickedEvent>
  ) {}

  @Listen("pageClicked")
  pageClickedHandler(_eventInfo: CustomEvent) {}
}

export interface ChPaginatorActivePageChangedEvent {
  page: number;
}
