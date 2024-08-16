export type CodeToJSX = (
  code: string,
  language: string,
  shouldFindLastNestedChild: boolean,
  lastNestedChildClass: string
) => Promise<{ renderedCode: any; lastNestedChildIsRoot: boolean }>;
