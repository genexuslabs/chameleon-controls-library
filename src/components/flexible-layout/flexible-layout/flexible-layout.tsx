import { Component, Host, Prop, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutDisplayedItems,
  FlexibleLayoutGroup,
  FlexibleLayoutItemBase
} from "../types";
import {
  BUTTON_CLASS,
  CAPTION_ID,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_NAME_CLASS,
  TAB_LIST_CLASS
} from "../utils";

const BLOCK_START_GROUP: FlexibleLayoutGroup = "block-start";
const INLINE_START_GROUP: FlexibleLayoutGroup = "inline-start";
const MAIN_GROUP: FlexibleLayoutGroup = "main";
const INLINE_END_GROUP: FlexibleLayoutGroup = "inline-end";
const BLOCK_END_GROUP: FlexibleLayoutGroup = "block-end";

// Export part functions
const FLEXIBLE_LAYOUT_GROUP_PARTS = [
  BUTTON_CLASS,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_NAME_CLASS,
  TAB_LIST_CLASS
];

const INLINE_START_PARTS = FLEXIBLE_LAYOUT_GROUP_PARTS.map(partFunction =>
  partFunction("inline-start")
).join(",");

const MAIN_PARTS = FLEXIBLE_LAYOUT_GROUP_PARTS.map(partFunction =>
  partFunction("main")
).join(",");

const INLINE_END_PARTS = FLEXIBLE_LAYOUT_GROUP_PARTS.map(partFunction =>
  partFunction("inline-end")
).join(",");

const BLOCK_END_PARTS = FLEXIBLE_LAYOUT_GROUP_PARTS.map(partFunction =>
  partFunction("block-end")
).join(",");

const CAPTION_PARTS = (items: FlexibleLayoutItemBase[]) =>
  items.map(item => CAPTION_ID(item.id)).join(",");

@Component({
  shadow: true,
  styleUrl: "flexible-layout.scss",
  tag: "ch-flexible-layout"
})
export class ChFlexibleLayout {
  /**
   * Specifies the items in the flexible layout that must be rendered.
   */
  @Prop() readonly displayedItems: FlexibleLayoutDisplayedItems = {
    blockStart: [],
    inlineStart: [],
    main: [],
    inlineEnd: [],
    blockEnd: []
  };

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layout: FlexibleLayout;

  private renderItems = (group: keyof FlexibleLayout) =>
    this.displayedItems[group].map(itemId => (
      <slot name={itemId} slot={itemId} />
    ));

  render() {
    const layout = this.layout;

    if (layout == null) {
      return "";
    }

    return (
      <Host>
        {layout.blockStart != null && ( // Top
          <ch-flexible-layout-group
            key={BLOCK_START_GROUP}
            class={BLOCK_START_GROUP}
            items={layout.blockStart}
            type={BLOCK_START_GROUP}
          >
            <slot />
          </ch-flexible-layout-group>
        )}

        {layout.inlineStart != null && ( // Left
          <ch-flexible-layout-group
            key={INLINE_START_GROUP}
            exportparts={
              INLINE_START_PARTS +
              ",selected," +
              CAPTION_PARTS(layout.inlineStart)
            }
            class={INLINE_START_GROUP}
            items={layout.inlineStart}
            type={INLINE_START_GROUP}
          >
            {this.renderItems("inlineStart")}
          </ch-flexible-layout-group>
        )}

        <ch-flexible-layout-group
          key={MAIN_GROUP}
          exportparts={
            MAIN_PARTS + ",selected," + CAPTION_PARTS(layout.main ?? [])
          }
          class={MAIN_GROUP}
          items={layout.main}
          type={MAIN_GROUP}
        >
          {this.renderItems("main")}
        </ch-flexible-layout-group>

        {layout.inlineEnd != null && ( // Right
          <ch-flexible-layout-group
            key={INLINE_END_GROUP}
            exportparts={
              INLINE_END_PARTS + ",selected," + CAPTION_PARTS(layout.inlineEnd)
            }
            class={INLINE_END_GROUP}
            items={layout.inlineEnd}
            type={INLINE_END_GROUP}
          >
            {this.renderItems("inlineEnd")}
          </ch-flexible-layout-group>
        )}

        {layout.blockEnd != null && ( // Bottom
          <ch-flexible-layout-group
            key={BLOCK_END_GROUP}
            exportparts={
              BLOCK_END_PARTS + ",selected," + CAPTION_PARTS(layout.blockEnd)
            }
            class={BLOCK_END_GROUP}
            items={layout.blockEnd}
            type={BLOCK_END_GROUP}
          >
            {this.renderItems("blockEnd")}
          </ch-flexible-layout-group>
        )}
      </Host>
    );
  }
}
