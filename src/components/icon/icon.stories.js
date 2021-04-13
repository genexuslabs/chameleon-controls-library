import { storiesOf } from "@storybook/html";
import notes from "./readme.md";

storiesOf("Components", module).add(
  "Icon",
  () => {
    return `<my-component first="Ruben" middle="Aguilera" last="Diaz-Heredero"></my-component>`;
  },
  { notes }
);
