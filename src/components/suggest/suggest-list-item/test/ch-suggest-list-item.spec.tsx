import { newSpecPage } from '@stencil/core/testing';
import { ChSuggestListItem } from '../ch-suggest-list-item';

describe('ch-suggest-list-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ChSuggestListItem],
      html: `<ch-suggest-list-item></ch-suggest-list-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-suggest-list-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-suggest-list-item>
    `);
  });
});
