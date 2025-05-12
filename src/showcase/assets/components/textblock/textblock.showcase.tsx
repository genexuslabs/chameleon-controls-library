import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";

const state: Partial<HTMLChTextblockElement> = {};

const render = () => (
  <ch-textblock
    accessibleRole={state.accessibleRole}
    autoGrow={state.autoGrow}
    caption={state.caption}
    format={state.format}
    showTooltipOnOverflow={state.showTooltipOnOverflow}
  >
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>

    <p>
      Some <i>custom</i> <b>HTML</b>
    </p>

    <h2>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </h2>

    <b>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </b>

    <i>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </i>

    <b>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </b>

    <i>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </i>

    <b>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos
      quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio
      consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
    </b>
  </ch-textblock>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChTextblockElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "caption",
          caption: "Caption",
          value: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.

  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.

  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.
  
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt hic quos quia provident odit ad praesentium voluptas! Id aspernatur eum veniam odio consequuntur ea culpa aut unde, reprehenderit fugit perspiciatis.`,
          render: "textarea",
          type: "string"
        },
        {
          id: "accessibleRole",
          caption: "Accessible Role",
          value: "p",
          values: [
            { caption: "Heading 1", value: "h1" },
            { caption: "Heading 2", value: "h2" },
            { caption: "Heading 3", value: "h3" },
            { caption: "Heading 4", value: "h4" },
            { caption: "Heading 5", value: "h5" },
            { caption: "Heading 6", value: "h6" },
            { caption: "Paragraph", value: "p" }
          ],
          type: "enum"
        },
        {
          id: "format",
          caption: "Format",
          value: "text",
          type: "enum",
          render: "radio-group",
          values: [
            { value: "HTML", caption: "HTML" },
            { value: "text", caption: "Text" }
          ]
        },
        {
          id: "autoGrow",
          caption: "Auto Grow",
          value: false,
          type: "boolean"
        },
        {
          id: "showTooltipOnOverflow",
          caption: "Show Tooltip On Overflow",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

export const textBlockShowcaseStory: ShowcaseStory<HTMLChTextblockElement> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
