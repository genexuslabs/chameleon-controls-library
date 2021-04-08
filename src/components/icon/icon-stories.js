import { storiesOf } from "@storybook/html";

import readme from "./readme.md";

storiesOf("Test Component", module).add("Default", () => "<div>hola</div>", {
  notes: {
    markdown: readme,
  },
});
