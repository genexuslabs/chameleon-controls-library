export type ItemLink = {
  url: string | undefined;

  /**
   * Specifies the relationship between a linked resource and the current
   * document.
   *
   * sames as the [`rel` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/rel)
   * of the anchor element, `a`.
   */
  rel?: string;

  /**
   * Specifies where to display the linked URL, as the name for a browsing
   * context.
   *
   * Same as the [`target` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#target)
   * of the anchor element, `a`.
   *
   * If not specified, the browser's default is used.
   */
  target?: "_self" | "_blank" | "_parent" | "_top" | "_unfencedTop";
};
