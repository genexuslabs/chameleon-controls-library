export type CodeRender = (options: CodeRenderOptions) => any;

export type CodeRenderOptions = {
  addLastNestedChildClassInHost: boolean;
  language: string;
  lastNestedChildClass: string;
  plainText: string;
  renderedContent: any;
};

export type CodeToJSX = (
  code: string,
  language: string,
  shouldFindLastNestedChild: boolean,
  lastNestedChildClass: string
) => Promise<{ renderedCode: any; lastNestedChildIsRoot: boolean }>;
