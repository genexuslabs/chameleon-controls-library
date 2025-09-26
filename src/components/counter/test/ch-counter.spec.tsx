import { newSpecPage } from '@stencil/core/testing';
import { ChCounter } from '../ch-counter';

describe('ch-counter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ChCounter],
      html: `<ch-counter></ch-counter>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-counter>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-counter>
    `);
  });
});
