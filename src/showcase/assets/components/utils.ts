import {
  ShowcaseTemplateFrameWork,
  ShowcaseTemplatePropertyInfo,
  ShowcaseTemplatePropertyInfoVariable
} from "./types";

export const insertSpacesAtTheBeginningExceptForTheFirstLine = (
  text: string,
  spaces = 2
) =>
  text
    .split("\n")
    .map((line, index) => (index === 0 ? line : " ".repeat(spaces) + line))
    .join("\n");

const identUIModelReact = (uiModel: any[] | { [key: string]: any }) =>
  insertSpacesAtTheBeginningExceptForTheFirstLine(
    JSON.stringify(uiModel, undefined, 2)
  );

const identUIModelStencil = (uiModel: any[] | { [key: string]: any }) =>
  insertSpacesAtTheBeginningExceptForTheFirstLine(
    JSON.stringify(uiModel, undefined, 2)
  ) + ";";

export const defineControlMarkupWithUIModelReact = (
  uiModel: any[] | { [key: string]: any },
  uiModelType: string,
  renderMarkup: string
) =>
  `import { useState } from "react";
import { ${uiModelType} } from "@genexus/chameleon-controls-library";

const MyCustomDialog = () => {
  const [controlUIModel, setControlUIModel] = useState<${uiModelType}>(${identUIModelReact(
    uiModel
  )});

  return (
    <>
      ${renderMarkup}
    </>
  );
}

export default MyCustomDialog;`;

export const defineControlMarkupWithUIModelStencil = (
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
  #controlUIModel: ${uiModelType} = ${identUIModelStencil(uiModel)}

  render() {
    return (
      <Host>
        ${renderMarkup}
      </Host>
    );
  }
}`;

export const defineControlMarkupWithoutUIModelReact = (renderMarkup: string) =>
  `const MyCustomDialog = () => {
  return (
    <>
      ${renderMarkup}
    </>
  );
}

export default MyCustomDialog;`;

export const defineControlMarkupWithoutUIModelStencil = (
  renderMarkup: string
) =>
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

export const renderBooleanPropertyOrEmpty = <
  Dictionary extends { [key in string]: any },
  T extends keyof Dictionary
>(
  propertyName: T,
  state: Dictionary,
  spaces: number = 11
) =>
  state[propertyName]
    ? `
${Array(spaces).join(" ")}${propertyName as string}`
    : "";

const capitalizeFirstLetter = (word: string) =>
  word[0].toUpperCase() + word.slice(1);

const indentLine = (line: string, indentation: number) => `
${Array(indentation).join(" ")}${line as string}`;

const booleanRender = {
  react: <T extends boolean | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(
          value ? propertyName : `${propertyName}={${value}}`,
          indentation
        ),

  stencil: <T extends boolean | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(
          value ? propertyName : `${propertyName}={${value}}`,
          indentation
        )
} satisfies { [key in ShowcaseTemplateFrameWork]: (...args) => string };

const eventRender = {
  react: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(
          `on${capitalizeFirstLetter(propertyName)}={${value}}`,
          indentation
        ),

  stencil: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(
          `on${capitalizeFirstLetter(propertyName)}={this.#${value}}`,
          indentation
        )
} satisfies { [key in ShowcaseTemplateFrameWork]: (...args) => string };

const functionRender = {
  react: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={${value}}`, indentation),

  stencil: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={this.#${value}}`, indentation)
} satisfies { [key in ShowcaseTemplateFrameWork]: (...args) => string };

const numberRender = {
  react: <T extends number | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={${value}}`, indentation),

  stencil: <T extends number | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={${value}}`, indentation)
} satisfies { [key in ShowcaseTemplateFrameWork]: (...args) => string };

const stringRender = {
  react: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(
          `${propertyName === "class" ? "className" : propertyName}="${value}"`,
          indentation
        ),

  stencil: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}="${value}"`, indentation)
} satisfies { [key in ShowcaseTemplateFrameWork]: (...args) => string };

const stringTemplateRender = {
  react: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={\`${value}\`}`, indentation),

  stencil: <T extends string | undefined | null>(
    propertyName: string,
    value: T,
    defaultValue: T,
    indentation: number
  ) =>
    value === defaultValue
      ? ""
      : indentLine(`${propertyName}={\`${value}\`}`, indentation)
};

const propertyTypeRender = {
  boolean: booleanRender,
  event: eventRender,
  function: functionRender,
  number: numberRender,
  string: stringRender,
  "string-template": stringTemplateRender
} as const;

const defaultIndentationByFramework = (
  framework: ShowcaseTemplateFrameWork
) => {
  if (framework === "react") {
    return 9;
  }

  return 11;
};

const renderProperty = <
  Dictionary extends { [key in string]: any },
  T extends keyof Dictionary
>(
  propertyName: T,
  state: Dictionary,
  type:
    | "boolean"
    | "event"
    | "function"
    | "number"
    | "string"
    | "string-template",
  framework: ShowcaseTemplateFrameWork,
  defaultValue: Dictionary[T],
  indentation?: number,
  value?: any
) =>
  // TODO: Improve type safety
  (propertyTypeRender[type][framework] as any)(
    propertyName,
    value ?? state[propertyName],
    defaultValue,
    indentation ?? defaultIndentationByFramework(framework)
  );

export const renderShowcaseProperties = <
  Dictionary extends { [key in string]: any }
>(
  state: Dictionary,
  framework: ShowcaseTemplateFrameWork,
  properties: ShowcaseTemplatePropertyInfo<Dictionary>[],
  indentation?: number
) =>
  properties
    .map(propertyInfo =>
      propertyInfo.fixed
        ? renderProperty(
            propertyInfo.name,
            state,
            propertyInfo.type,
            framework,
            undefined,
            indentation,
            propertyInfo.value
          )
        : renderProperty(
            propertyInfo.name,
            state,
            propertyInfo.type,
            framework,
            (
              propertyInfo as ShowcaseTemplatePropertyInfoVariable<
                Dictionary,
                keyof Dictionary
              >
            ).defaultValue,
            indentation
          )
    )
    .join("");

export const showcaseTemplateClassProperty = (
  framework: ShowcaseTemplateFrameWork,
  value: string
) => (framework === "react" ? `className="${value}"` : `class="${value}"`);
