interface ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}
interface CSSStyleSheet {
  replace(text: string): Promise<CSSStyleSheet>;
  replaceSync(text: string): void;
}
