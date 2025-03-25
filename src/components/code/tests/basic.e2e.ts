import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../testing/utils.e2e";

testDefaultProperties("ch-code", {
  language: undefined,
  lastNestedChildClass: "last-nested-child",
  showIndicator: false,
  value: undefined
});

testDefaultCssProperties("ch-code", {
  "--ch-code-indicator-color": "currentColor",
  "--ch-code-inline-size": "1.125ch",
  "--ch-code-block-size": "1em",
  "--ch-code__addition": "currentColor",
  "--ch-code__attr": "currentColor",
  "--ch-code__attribute": "currentColor",
  "--ch-code__built-in": "currentColor",
  "--ch-code__bullet": "currentColor",
  "--ch-code__class": "currentColor",
  "--ch-code__code": "currentColor",
  "--ch-code__comment": "currentColor",
  "--ch-code__deletion": "currentColor",
  "--ch-code__doctag": "currentColor",
  "--ch-code__formula": "currentColor",
  "--ch-code__function": "currentColor",
  "--ch-code__function-variable": "currentColor",
  "--ch-code__keyword": "currentColor",
  "--ch-code__link": "currentColor",
  "--ch-code__literal": "currentColor",
  "--ch-code__meta": "currentColor",
  "--ch-code__meta__keyword": "currentColor",
  "--ch-code__meta__string": "currentColor",
  "--ch-code__name": "currentColor",
  "--ch-code__number": "currentColor",
  "--ch-code__operator": "currentColor",
  "--ch-code__regexp": "currentColor",
  "--ch-code__quote": "currentColor",
  "--ch-code__selector-attr": "currentColor",
  "--ch-code__selector-class": "currentColor",
  "--ch-code__selector-id": "currentColor",
  "--ch-code__selector-pseudo": "currentColor",
  "--ch-code__selector-tag": "currentColor",
  "--ch-code__string": "currentColor",
  "--ch-code__subst": "currentColor",
  "--ch-code__symbol": "currentColor",
  "--ch-code__tag": "currentColor",
  "--ch-code__template-tag": "currentColor",
  "--ch-code__template-variable": "currentColor",
  "--ch-code__title": "currentColor",
  "--ch-code__title-class": "currentColor",
  "--ch-code__title-class-inherited": "currentColor",
  "--ch-code__title-function": "currentColor",
  "--ch-code__type": "currentColor",
  "--ch-code__variable": "currentColor",
  "--ch-code__variable-language": "currentColor"
});

describe("[ch-code][basic]", () => {
  let page: E2EPage;
  let codeRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-code></ch-code>`,
      failOnConsoleError: true
    });
    codeRef = await page.find("ch-code");
  });

  it("should have Shadow DOM", () => expect(codeRef.shadowRoot).toBeTruthy());

  // it("should render empty by default", () =>
  //   expect(codeRef.shadowRoot.innerHTML).toBeFalsy());
});
