import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const LAST_NESTED_CHILD_CLASS = ' class="last-nested-child"';
const LIT_COMMENTS_REGEX = /(<\!\-\-\-\->|<\!\-\-\?lit\$\d+\$\-\->)/g;

const getTestData: (text: string) => [string, string, string][] = text => [
  [`# ${text}`, `<h1${LAST_NESTED_CHILD_CLASS}>${text}</h1>`, "the h1"],
  [`## ${text}`, `<h2${LAST_NESTED_CHILD_CLASS}>${text}</h2>`, "the h2"],
  [`### ${text}`, `<h3${LAST_NESTED_CHILD_CLASS}>${text}</h3>`, "the h3"],
  [`#### ${text}`, `<h4${LAST_NESTED_CHILD_CLASS}>${text}</h4>`, "the h4"],
  [`##### ${text}`, `<h5${LAST_NESTED_CHILD_CLASS}>${text}</h5>`, "the h5"],
  [`###### ${text}`, `<h6${LAST_NESTED_CHILD_CLASS}>${text}</h6>`, "the h6"],
  [
    `${text}\n===`,
    `<h1${LAST_NESTED_CHILD_CLASS}>${text}</h1>`,
    "the alternative h1"
  ],
  [
    `${text}\n===========`,
    `<h1${LAST_NESTED_CHILD_CLASS}>${text}</h1>`,
    "the alternative h1"
  ],
  [
    `${text}\n---`,
    `<h2${LAST_NESTED_CHILD_CLASS}>${text}</h2>`,
    "the alternative h2"
  ],
  [
    `${text}\n-----------`,
    `<h2${LAST_NESTED_CHILD_CLASS}>${text}</h2>`,
    "the alternative h2"
  ],
  [`${text}`, `<p${LAST_NESTED_CHILD_CLASS}>${text}</p>`, "the paragraph"],
  [
    `${text}\n${text} 2`,
    `<p${LAST_NESTED_CHILD_CLASS}>${text}\n${text} 2</p>`,
    "in the same paragraph with only line break"
  ],
  [
    `${text}\n\n${text} 2`,
    `<p>${text}</p><p${LAST_NESTED_CHILD_CLASS}>${text} 2</p>`,
    "multiples paragraphs"
  ],
  [
    `_${text}_`,
    `<p><em${LAST_NESTED_CHILD_CLASS}>${text}</em></p>`,
    "with italic"
  ],
  [
    `*${text}*`,
    `<p><em${LAST_NESTED_CHILD_CLASS}>${text}</em></p>`,
    "with italic"
  ],
  [
    `__${text}__`,
    `<p><strong${LAST_NESTED_CHILD_CLASS}>${text}</strong></p>`,
    "with bold"
  ],
  [
    `**${text}**`,
    `<p><strong${LAST_NESTED_CHILD_CLASS}>${text}</strong></p>`,
    "with bold"
  ],
  [
    `Dummy**${text}**Dummy`,
    `<p${LAST_NESTED_CHILD_CLASS}>Dummy<strong>${text}</strong>Dummy</p>`,
    "with bold in between the same word"
  ],
  [
    `**${text}** *${text}*`,
    `<p><strong>${text}</strong><em${LAST_NESTED_CHILD_CLASS}>${text}</em></p>`,
    "mixed bold and italic"
  ],
  [
    `__${text}__ _${text}_`,
    `<p><strong>${text}</strong><em${LAST_NESTED_CHILD_CLASS}>${text}</em></p>`,
    "mixed bold and italic"
  ],
  [
    `_${text}_ **${text}**`,
    `<p><em>${text}</em><strong${LAST_NESTED_CHILD_CLASS}>${text}</strong></p>`,
    "mixed bold and italic"
  ],
  [
    `> ${text}`,
    `<blockquote><p${LAST_NESTED_CHILD_CLASS}>${text}</p></blockquote>`,
    "the blockquote"
  ],
  [
    `> ${text}
  > ${text} 2`,
    `<blockquote><p${LAST_NESTED_CHILD_CLASS}>${text}\n${text} 2</p></blockquote>`,
    "the multiline blockquote"
  ],
  [
    `> ${text}
  >> ${text} 2`,
    `<blockquote><p>${text}</p><blockquote><p${LAST_NESTED_CHILD_CLASS}>${text} 2</p></blockquote></blockquote>`,
    "the nested blockquote"
  ],
  [
    `> ${text}
  >> ${text} 2
  >
  > ${text} 3`,
    `<blockquote><p>${text}</p><blockquote><p>${text} 2</p></blockquote><p${LAST_NESTED_CHILD_CLASS}>${text} 3</p></blockquote>`,
    "the nested blockquote with text after"
  ],
  [
    `\`${text}\``,
    // TODO: Is this result okay??? The last nested child should be inside the
    // code tag and the class "hljs" should not be added
    `<p${LAST_NESTED_CHILD_CLASS}><code class="hljs">${text}</code></p>`,
    "the inline code"
  ],
  [
    `- ${text}`,
    `<ul><li><p${LAST_NESTED_CHILD_CLASS}>${text}</p></li></ul>`,
    "the ul with the single li"
  ],
  [
    `- ${text}\n- ${text} 2`,
    `<ul><li><p>${text}</p></li><li><p${LAST_NESTED_CHILD_CLASS}>${text} 2</p></li></ul>`,
    "the ul with multiples li"
  ],
  [
    `1. ${text}`,
    `<ol start="1"><li><p${LAST_NESTED_CHILD_CLASS}>${text}</p></li></ol>`,
    "the ol with the single li"
  ],
  [
    `1. ${text}\n2. ${text} 2`,
    `<ol start="1"><li><p>${text}</p></li><li><p${LAST_NESTED_CHILD_CLASS}>${text} 2</p></li></ol>`,
    "the ol with multiples li"
  ],
  [
    `3. ${text}\n`,
    `<ol start="3"><li><p${LAST_NESTED_CHILD_CLASS}>${text}</p></li></ol>`,
    'the ol with multiples li and start="3"'
  ],
  [
    `3. ${text}\n4. ${text} 2`,
    `<ol start="3"><li><p>${text}</p></li><li><p${LAST_NESTED_CHILD_CLASS}>${text} 2</p></li></ol>`,
    'the ol with multiples li and start="3"'
  ],
  [
    // TODO: Is this result okay???? Should it be a p tag???
    `![${text}](showcase/pages/assets/icons/angular.svg)`,
    `<p${LAST_NESTED_CHILD_CLASS}><img alt="${text}" loading="lazy" src="showcase/pages/assets/icons/angular.svg"></p>`,
    "the image"
  ],
  [
    // TODO: Is this result okay???? Should it be a p tag???
    `![](showcase/pages/assets/icons/angular.svg)`,
    `<p${LAST_NESTED_CHILD_CLASS}><img alt="" loading="lazy" src="showcase/pages/assets/icons/angular.svg"></p>`,
    "the image with an empty alt"
  ],
  [
    // TODO: Is this result okay???? Should it be a p tag???
    `[${text}](showcase/pages/assets/icons/angular.svg)`,
    `<p><a${LAST_NESTED_CHILD_CLASS} href="showcase/pages/assets/icons/angular.svg">${text}</a></p>`,
    "the hyperlink"
  ],
  [
    // TODO: Is this result okay???? Should it be a p tag???
    `[](showcase/pages/assets/icons/angular.svg)`,
    `<p${LAST_NESTED_CHILD_CLASS}><a href="showcase/pages/assets/icons/angular.svg"></a></p>`,
    "the hyperlink with an empty body"
  ]
];

describe("[ch-markdown-viewer][value]", () => {
  let page: E2EPage;
  let markdownViewerRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-markdown-viewer></ch-markdown-viewer>`,
      failOnConsoleError: true
    });
    markdownViewerRef = await page.find("ch-markdown-viewer");
  });

  const testValueRender = (
    value: string,
    render: string,
    description: string
  ) => {
    it(`should render ${description} when the "value" property is "${value}"`, async () => {
      markdownViewerRef.setProperty("value", value);
      await page.waitForChanges();
      markdownViewerRef = await page.find("ch-markdown-viewer"); // Refresh the reference

      expect(
        markdownViewerRef.shadowRoot.innerHTML.replace(LIT_COMMENTS_REGEX, "")
      ).toEqualHtml(
        `<ch-theme class="hydrated" hidden=""></ch-theme><ch-markdown-viewer-lit>${render}</ch-markdown-viewer-lit>`
      );
    });
  };

  getTestData("Hello").forEach(data =>
    testValueRender(data[0], data[1], data[2])
  );
  getTestData("Hello world").forEach(data =>
    testValueRender(data[0], data[1], data[2])
  );
  getTestData(
    "Lorem ipsum dolor sit amet consectetur adipisicing elit"
  ).forEach(data => testValueRender(data[0], data[1], data[2]));

  testValueRender(
    `Dummy**Hello world.**Dummy`,
    `<p${LAST_NESTED_CHILD_CLASS}>Dummy**Hello world.**Dummy</p>`,
    "the paragraph without the bold because it ends with a dot"
  );

  // TODO: Add unit test for updating the value at runtime
  // TODO: Add unit test for checking that the DOM is reused
  // TODO: Add unit test for checking the ch-code value bindings
});
