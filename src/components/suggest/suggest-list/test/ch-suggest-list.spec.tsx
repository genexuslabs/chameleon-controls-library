import { newSpecPage } from '@stencil/core/testing';
import { ChSuggestList } from '../ch-suggest-list';

describe('ch-suggest-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ChSuggestList],
      html: `<ch-suggest-list></ch-suggest-list>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-suggest-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-suggest-list>
    `);
  });
});
