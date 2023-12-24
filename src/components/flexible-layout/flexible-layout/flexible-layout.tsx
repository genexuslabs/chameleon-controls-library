import {
  Component,
  Event,
  EventEmitter,
  Prop,
  forceUpdate,
  h
} from "@stencil/core";
import {
  FlexibleLayoutView,
  ViewItemCloseInfo,
  ViewSelectedItemInfo
} from "../types";

// import { mouseEventModifierKey } from "../../common/helpers";

import {
  TabItemCloseInfo,
  TabSelectedItemInfo,
  TabType
} from "../../tab/types";
import { ChTabCustomEvent } from "../../../components";
import { LayoutSplitterDistribution } from "../../layout-splitter/types";

// Keys
// const KEY_B = "KeyB";

@Component({
  shadow: true,
  styleUrl: "flexible-layout.scss",
  tag: "ch-flexible-layout"
})
export class ChFlexibleLayout {
  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layoutModel: LayoutSplitterDistribution;

  /**
   * Specifies additional parts to export.
   */
  @Prop() readonly layoutSplitterParts: string;

  /**
   * Specifies the information of each view displayed.
   */
  @Prop() readonly viewsInfo: Map<string, FlexibleLayoutView> = new Map();

  /**
   * Fired when a item of a view request to be closed.
   */
  @Event() viewItemClose: EventEmitter<ViewItemCloseInfo>;

  /**
   * Fired when the selected item change.
   */
  @Event() selectedViewItemChange: EventEmitter<ViewSelectedItemInfo>;

  // @Listen("keydown", { target: "document" })
  // handleKeyDownEvent(event: KeyboardEvent) {
  // if (
  //   !mouseEventModifierKey(event) ||
  //   event.code !== KEY_B ||
  //   this.layout.inlineStart == null
  // ) {
  //   return;
  // }
  // event.stopPropagation();
  // event.preventDefault();

  // this.layout.inlineStart.expanded = !(
  //   this.layout.inlineStart.expanded ?? true
  // );
  //   forceUpdate(this);
  // }

  private handleMainGroupExpand = () => {
    // if (this.layout.inlineStart) {
    //   this.layout.inlineStart.expanded = false;
    // }

    // if (this.layout.inlineEnd) {
    //   this.layout.inlineEnd.expanded = false;
    // }

    // if (this.layout.blockEnd) {
    //   this.layout.blockEnd.expanded = false;
    // }

    forceUpdate(this);
  };

  private handleItemChange =
    (viewId: string) => (event: ChTabCustomEvent<TabSelectedItemInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewSelectedItemInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.selectedViewItemChange.emit(eventInfo);
    };

  private handleItemClose =
    (viewId: string) => (event: ChTabCustomEvent<TabItemCloseInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewItemCloseInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.viewItemClose.emit(eventInfo);
    };

  private renderTab = (tabType: TabType, viewInfo: FlexibleLayoutView) => (
    <ch-tab
      key={viewInfo.id}
      slot={viewInfo.id}
      exportparts={viewInfo.exportParts}
      items={viewInfo.widgets}
      type={tabType}
      onExpandMainGroup={tabType === "main" ? this.handleMainGroupExpand : null}
      onItemClose={this.handleItemClose(viewInfo.id)}
      onSelectedItemChange={this.handleItemChange(viewInfo.id)}
    >
      {[...viewInfo.renderedWidgets.values()].map(widgetId => (
        <slot name={widgetId} slot={widgetId} />
      ))}
    </ch-tab>
  );

  private renderView = (view: FlexibleLayoutView) =>
    view.type === "blockStart" ? (
      <header key={view.id} slot={view.id}>
        <slot />
      </header>
    ) : (
      this.renderTab(view.type, view)
    );

  render() {
    const layoutModel = this.layoutModel;

    if (layoutModel == null) {
      return "";
    }

    return (
      <ch-layout-splitter
        layout={layoutModel}
        exportparts={"bar," + this.layoutSplitterParts}
      >
        {[...this.viewsInfo.values()].map(this.renderView)}
      </ch-layout-splitter>
    );
  }
}
