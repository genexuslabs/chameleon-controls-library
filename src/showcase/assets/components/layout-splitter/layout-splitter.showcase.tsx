import { h } from "@stencil/core";
import { ChLayoutSplitter } from "../../../../components/layout-splitter/layout-splitter";
import { ShowcaseRenderProperties, ShowcaseStory } from "../showcase/types";
import { Mutable } from "../../../../common/types";
import {
  layout1,
  layout2,
  layout3,
  layout4,
  layout5,
  layout6,
  layout7,
  layout8
} from "./models";

const state: Partial<Mutable<ChLayoutSplitter>> = {};

const render = () => (
  <ch-layout-splitter layout={state.layout}>
    <div
      slot="start-component"
      class="components"
      style={{
        "background-color": "var(--colors-foundation-un-color__purple--10)"
      }}
    >
      Start
      <input class="form-input" type="text" />
    </div>
    <div
      slot="end-component"
      class="components"
      style={{
        "background-color": "var(--colors-foundation-un-color__orange--200)"
      }}
    >
      End
      <input class="form-input" type="text" />
    </div>

    <div
      slot="end-end-component"
      class="components"
      style={{
        "background-color":
          "color-mix(in srgb, var(--icons-un-icon__error),transparent 60%)"
      }}
    >
      End End
      <input class="form-input" type="text" />
    </div>

    <div
      slot="center-2-component"
      class="components"
      style={{ "background-color": "var(--accents-un-accent__disabled)" }}
    >
      Center 2
      <input class="form-input" type="text" />
    </div>

    <div
      slot="center-component"
      class="components"
      style={{
        "background-color": "var(--un-alert-warning__background-color)"
      }}
    >
      Center
      <input class="form-input" type="text" />
    </div>
  </ch-layout-splitter>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChLayoutSplitter>
> = [
  {
    caption: "Models",
    properties: [
      {
        id: "layout",
        accessibleName: "Model",
        type: "enum",
        values: [
          { caption: "Layout 1", value: layout1 },
          { caption: "Layout 2", value: layout2 },
          { caption: "Layout 3", value: layout3 },
          { caption: "Layout 4", value: layout4 },
          { caption: "Layout 5", value: layout5 },
          { caption: "Layout 6", value: layout6 },
          { caption: "Layout 7", value: layout7 },
          { caption: "Layout 8", value: layout8 }
        ],
        value: layout2
      }
    ]
  }
];

export const layoutSplitterShowcaseStory: ShowcaseStory<
  Mutable<ChLayoutSplitter>
> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};