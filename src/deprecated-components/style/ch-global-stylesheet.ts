const CH_GLOBAL_STYLESHEET = new CSSStyleSheet({ disabled: true });

export function adoptGlobalStyleSheet(adoptedStyleSheets: CSSStyleSheet[]) {
  adoptedStyleSheets.push(CH_GLOBAL_STYLESHEET);
}

export function appendStyle(text: string) {
  const styleSheetParser = new CSSStyleSheet({ disabled: true });

  styleSheetParser.replace(text);
  for (let i = 0; i < styleSheetParser.cssRules.length; i++) {
    CH_GLOBAL_STYLESHEET.insertRule(styleSheetParser.cssRules.item(i).cssText);
  }
}
export function enableStyleSheet() {
  CH_GLOBAL_STYLESHEET.disabled = false;
}
