import { newSpecPage } from '@stencil/core/testing';
import { ChSuggest } from '../ch-suggest';

describe('ch-suggest', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ChSuggest],
      html: `<ch-suggest></ch-suggest>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-suggest>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-suggest>
    `);
  });
});
