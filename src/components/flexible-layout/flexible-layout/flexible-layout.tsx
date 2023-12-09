import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  forceUpdate,
  h
} from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutSplitterModel,
  FlexibleLayoutView,
  ViewSelectedItemInfo,
  ViewType
} from "../types";

// import { mouseEventModifierKey } from "../../common/helpers";

import { TabSelectedItemInfo, TabType } from "../../tab/types";
import { ChTabCustomEvent } from "../../../components";

// Keys
// const KEY_B = "KeyB";

const BLOCK_START_TYPE: ViewType = "blockStart";
const INLINE_START_TYPE: TabType = "inlineStart";
const MAIN_TYPE: TabType = "main";
const INLINE_END_TYPE: TabType = "inlineEnd";
const BLOCK_END_TYPE: TabType = "blockEnd";

@Component({
  shadow: true,
  styleUrl: "flexible-layout.scss",
  tag: "ch-flexible-layout"
})
export class ChFlexibleLayout {
  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layoutModel: {
    [key in keyof FlexibleLayout]: FlexibleLayoutSplitterModel;
  };

  /**
   * Specifies the information of each view displayed.
   */
  @Prop() readonly viewsInfo: Map<string, FlexibleLayoutView> = new Map();

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

  private renderTab = (tabType: TabType, viewId: string) => {
    const viewInfo = this.viewsInfo.get(viewId);

    return (
      <ch-tab
        key={viewId}
        slot={viewId}
        exportparts={viewInfo.exportParts}
        items={viewInfo.widgets}
        type={tabType}
        onExpandMainGroup={
          tabType === "main" ? this.handleMainGroupExpand : null
        }
        onSelectedItemChange={this.handleItemChange(viewId)}
      >
        {[...viewInfo.renderedWidgets.values()].map(widgetId => (
          <slot name={widgetId} slot={widgetId} />
        ))}
      </ch-tab>
    );
  };

  private renderViews = (
    model: FlexibleLayoutSplitterModel,
    tabType: TabType
  ) => [...model.views].map(view => this.renderTab(tabType, view));

  render() {
    const layoutModel = this.layoutModel;

    if (layoutModel == null) {
      return "";
    }

    return (
      <Host>
        <header class={BLOCK_START_TYPE}>
          <slot />
        </header>

        <aside class={INLINE_START_TYPE}>
          {layoutModel.inlineStart?.model != null ? ( // Left
            <ch-layout-splitter
              key={INLINE_START_TYPE}
              layout={layoutModel.inlineStart.model}
            >
              {this.renderViews(layoutModel.inlineStart, INLINE_START_TYPE)}
            </ch-layout-splitter>
          ) : (
            layoutModel.inlineStart &&
            this.renderTab(INLINE_START_TYPE, INLINE_START_TYPE)
          )}
        </aside>

        <main class={MAIN_TYPE}>
          {layoutModel.main?.model != null ? ( // Main
            <ch-layout-splitter key={MAIN_TYPE} layout={layoutModel.main.model}>
              {this.renderViews(layoutModel.main, MAIN_TYPE)}
            </ch-layout-splitter>
          ) : (
            layoutModel.main && this.renderTab(MAIN_TYPE, MAIN_TYPE)
          )}
        </main>

        <aside class={INLINE_END_TYPE}>
          {layoutModel.inlineEnd?.model != null ? ( // Right
            <ch-layout-splitter
              key={INLINE_END_TYPE}
              layout={layoutModel.inlineEnd.model}
            >
              {this.renderViews(layoutModel.inlineEnd, INLINE_END_TYPE)}
            </ch-layout-splitter>
          ) : (
            layoutModel.inlineEnd &&
            this.renderTab(INLINE_END_TYPE, INLINE_END_TYPE)
          )}
        </aside>

        <footer class={BLOCK_END_TYPE}>
          {layoutModel.blockEnd?.model != null ? ( // Bottom
            <ch-layout-splitter
              key={BLOCK_END_TYPE}
              layout={layoutModel.blockEnd.model}
            >
              {this.renderViews(layoutModel.blockEnd, BLOCK_END_TYPE)}
            </ch-layout-splitter>
          ) : (
            layoutModel.blockEnd &&
            this.renderTab(BLOCK_END_TYPE, BLOCK_END_TYPE)
          )}
        </footer>
      </Host>
    );
  }
}
