const insertSpacesAtTheBeginningExceptForTheFirstLine = (
  text: string,
  spaces = 2
) =>
  text
    .split("\n")
    .map((line, index) => (index === 0 ? line : " ".repeat(spaces) + line))
    .join("\n");

const identUIModel = (uiModel: any[] | { [key: string]: any }) =>
  insertSpacesAtTheBeginningExceptForTheFirstLine(
    JSON.stringify(uiModel, undefined, 2)
  ) + ";";

export const defineControlMarkupWithUIModel = (
  uiModel: any[] | { [key: string]: any },
  uiModelType: string,
  renderMarkup: string
) =>
  `import { Component, Host, h } from "@stencil/core";
import { ${uiModelType} } from "@genexus/chameleon-controls-library";

@Component({
  tag: "my-custom-dialog",
  styleUrl: "my-custom-dialog.scss",
  shadow: true
})
export class MyCustomDialog {
  #controlUIModel: ${uiModelType} = ${identUIModel(uiModel)}

  render() {
    return (
      <Host>
        ${renderMarkup}
      </Host>
    );
  }
}`;

export const defineControlMarkupWithoutUIModel = (renderMarkup: string) =>
  `import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "my-custom-dialog",
  styleUrl: "my-custom-dialog.scss",
  shadow: true
})
export class MyCustomDialog {
  render() {
    return (
      <Host>
        ${renderMarkup}
      </Host>
    );
  }
}`;
