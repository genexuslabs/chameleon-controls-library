import { storiesOf } from "@storybook/html";
import notes from "./readme.md";
import {
  withKnobs,
  text,
  boolean,
  number,
  select,
  radios,
  color,
} from "@storybook/addon-knobs";

const stories = storiesOf("Components", module);
stories.addDecorator(withKnobs);
stories.addParameters({ layout: "centered" });
stories.add(
  "Icon",
  () => {
    //Auto color
    const labelAutoColor = "Auto color (displays the native icon color)";
    const defaultValueAutoColor = false;
    const valueAutoColor = boolean(labelAutoColor, defaultValueAutoColor);
    function autoColor() {
      if (valueAutoColor) {
        return "auto-color";
      }
    }

    //Color
    const labelColor = "Color";
    const defaultValueColor = "#20A7FD";
    const valueColor = color(labelColor, defaultValueColor);

    //Size
    const labelSize = "Size";
    const defaultValueSize = "50px";
    const valueSize = text(labelSize, defaultValueSize);

    return `
    <style>
      ch-icon {
        padding: 30px; 
      }
    </style>
    <div class="icons-container">
      <div class="icons-row">
      <ch-icon src="/chameleon/icon-assets/generator.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      <ch-icon src="/chameleon/icon-assets/java.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      <ch-icon src="/chameleon/icon-assets/knowledge-base.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      </div">
      <div class="icons-row">
      <ch-icon src="/chameleon/icon-assets/patterns.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      <ch-icon src="/chameleon/icon-assets/sql-server.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      <ch-icon src="/chameleon/icon-assets/csharp.svg" style="--icon-size:${valueSize}; --icon-color:${valueColor}" ${autoColor()}></ch-icon>
      </div">
    <div`;
  },
  { notes }
);
