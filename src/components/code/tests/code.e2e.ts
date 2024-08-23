import { newE2EPage } from "@stencil/core/testing";

// const delay = (value: number) =>
//   new Promise(resolve => setTimeout(resolve, value));

const HELLO_WORLD = "console.log('Hello world')";

const COMPLEX_CODE = `function renderCodeChildren(
    element: HRoot | HElement,
    lastNestedChildClass: string,
    lastNestedChild: LastNestedChild
  ) {
    return element.children.map(child =>
      codeToJSXDictionary[child.type](
        child,
        lastNestedChildClass,
        lastNestedChild
      )
    );
  }

  const findLastNestedChild = (elementWithChildren: HRoot | HElement) => {
    const lastChild = elementWithChildren.children.at(-1);

    // The last element have children. We must check its sub children
    if ((lastChild as HElement).children?.length > 0) {
      return findLastNestedChild(lastChild as HElement);
    }

    return elementWithChildren;
  };`;

const COMPLEX_PARSED_CODE = `<code class="hljs language-typescript" part="code language-typescript"><span class="hljs-keyword">function</span> <span class="hljs-title function_">renderCodeChildren</span>(<span class="hljs-params">
    element: HRoot | HElement,
    lastNestedChildClass: <span class="hljs-built_in">string</span>,
    lastNestedChild: LastNestedChild
  </span>) {
    <span class="hljs-keyword">return</span> element.<span class="hljs-property">children</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function"><span class="hljs-params">child</span> =&gt;</span>
      codeToJSXDictionary[child.<span class="hljs-property">type</span>](
        child,
        lastNestedChildClass,
        lastNestedChild
      )
    );
  }

  <span class="hljs-keyword">const</span> <span class="hljs-title function_">findLastNestedChild</span> = (<span class="hljs-params">elementWithChildren: HRoot | HElement</span>) =&gt; {
    <span class="hljs-keyword">const</span> lastChild = elementWithChildren.<span class="hljs-property">children</span>.<span class="hljs-title function_">at</span>(-<span class="hljs-number">1</span>);

    <span class="hljs-comment">// The last element have children. We must check its sub children</span>
    <span class="hljs-keyword">if</span> ((lastChild <span class="hljs-keyword">as</span> <span class="hljs-title class_">HElement</span>).<span class="hljs-property">children</span>?.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">return</span> <span class="hljs-title function_">findLastNestedChild</span>(lastChild <span class="hljs-keyword">as</span> <span class="hljs-title class_">HElement</span>);
    }

    <span class="hljs-keyword">return</span> elementWithChildren;
  };</code>`;

describe("[ch-code]", () => {
  // If this test fails with "App did not load in allowed time. Please ensure the content loads a stencil application.",
  // set --maxWorkers=1 in the test script of the package.json.
  // For more information: https://github.com/ionic-team/stencil/issues/4782
  it("should render a ch-code", async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code></ch-code>`);
    const codeRef = await page.find("ch-code");

    expect(codeRef).not.toBeNull();
  });

  it("should have a shadowRoot", async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code></ch-code>`);
    const codeRef = await page.find("ch-code");

    expect(codeRef.shadowRoot).not.toBeNull();
  });

  it("should render an empty <code> when no value is provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code></ch-code>`);
    const codeRef = await page.find("ch-code");

    expect(codeRef.shadowRoot).toEqualHtml(
      `<code class="hljs language-plaintext" part="code language-plaintext"></code>`
    );
  });

  it('should set a part with "language-<language name>" in the <code>', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code language="typescript"></ch-code>`);
    const codeRef = await page.find("ch-code");

    expect(codeRef.shadowRoot).toEqualHtml(
      `<code class="hljs language-typescript" part="code language-typescript"></code>`
    );
  });

  it('should have "white-space: pre" to properly display the content', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code language="typescript"></ch-code>`);
    const codeRef = await page.find("ch-code");

    const computedStyle = await codeRef.getComputedStyle();

    expect(computedStyle.whiteSpace).toBe("pre");
  });

  it('should have "overflow: auto" to properly display the content', async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code language="typescript"></ch-code>`);
    const codeRef = await page.find("ch-code");

    const computedStyle = await codeRef.getComputedStyle();

    expect(computedStyle.overflow).toBe("auto");
  });

  it("should render a hello world", async () => {
    const page = await newE2EPage();

    await page.setContent(
      `<ch-code language="typescript" value="${HELLO_WORLD}"></ch-code>`
    );
    const codeRef = await page.find("ch-code");

    const firstLoad = !codeRef.shadowRoot.querySelector("span");

    // The ch-code renders two times on the initial load to avoid waiting for
    // the lazy code parser
    if (firstLoad) {
      expect(codeRef.shadowRoot).toEqualHtml(
        `<code class="hljs language-typescript" part="code language-typescript">${HELLO_WORLD}</code>`
      );
    } else {
      expect(codeRef.shadowRoot).toEqualHtml(
        `<code class="hljs language-typescript" part="code language-typescript"><span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">'Hello world'</span>)</code>`
      );
    }
  });

  // TODO: Fix this test
  it.skip("should render a complex template", async () => {
    const page = await newE2EPage();
    await page.setContent(`<ch-code language="typescript"></ch-code>`);
    const codeRef = await page.find("ch-code");

    await page.waitForChanges();
    codeRef.setProperty("value", COMPLEX_CODE);

    const firstLoad = !codeRef.shadowRoot.querySelector("span");

    // The ch-code renders two times on the initial load to avoid waiting for
    // the lazy code parser
    if (firstLoad) {
      expect(codeRef.shadowRoot).toEqualHtml(
        `<code class="hljs language-typescript" part="code language-typescript">${COMPLEX_CODE}</code>`
      );
    } else {
      expect(codeRef.shadowRoot).toEqualHtml(COMPLEX_PARSED_CODE);
    }
  });
});
