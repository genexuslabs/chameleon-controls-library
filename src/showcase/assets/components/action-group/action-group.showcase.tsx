import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { GXWebModel, eagerLargeModel, modelMinimal } from "./models";

const state: Partial<HTMLChActionGroupRenderElement> = {};

const render = () => (
  <div class="action-group-test-main-wrapper">
    <div class="fieldset-test">
      <legend class="label field-legend-test">Primary</legend>

      <ch-action-group-render
        class="dropdown dropdown-secondary"
        model={state.model}
        moreActionsBlockAlign={state.moreActionsBlockAlign}
        moreActionsCaption={state.moreActionsCaption}
        moreActionsInlineAlign={state.moreActionsInlineAlign}
        itemsOverflowBehavior={state.itemsOverflowBehavior}
        // moreActionsDropdownPosition={state.moreActionsDropdownPosition}
      >
        <ch-edit slot="pepe" class="input" type="search"></ch-edit>
      </ch-action-group-render>
    </div>
    {/* 
    <div class="fieldset-test">
      <legend class="label field-legend-test">Secondary</legend>

      <ch-action-group-render
        class="dropdown dropdown-secondary"
        model={state.model}
        itemsOverflowBehavior={state.itemsOverflowBehavior}
        // moreActionsDropdownPosition={state.moreActionsDropdownPosition}
      ></ch-action-group-render>
    </div> */}
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChActionGroupRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Simple model", value: modelMinimal },
            { caption: "GX Web Model", value: GXWebModel },
            { caption: "Eager Large Tree (10x20x20)", value: eagerLargeModel }
          ],
          value: GXWebModel
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "moreActionsCaption",
          caption: "More actions caption",
          type: "string",
          value: "More"
        },
        {
          id: "moreActionsBlockAlign",
          caption: "More Actions Block Align",
          value: "outside-end",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },
        {
          id: "moreActionsInlineAlign",
          caption: "More Actions Inline Align",
          value: "inside-start",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },

        {
          id: "itemsOverflowBehavior",
          caption: "Items overflow behavior",
          value: "responsive-collapse",
          type: "enum",
          values: [
            { caption: "Add Scroll", value: "add-scroll" },
            { caption: "Multiline", value: "multiline" },
            { caption: "Responsive Collapse", value: "responsive-collapse" }
          ]
        }
      ]
    }
  ];

export const actionGroupShowcaseStory: ShowcaseStory<HTMLChActionGroupRenderElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };
