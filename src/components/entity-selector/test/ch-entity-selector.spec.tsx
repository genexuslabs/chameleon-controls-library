import { newSpecPage } from '@stencil/core/testing';
import { ChEntitySelector } from '../ch-entity-selector';

describe('ch-entity-selector', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ChEntitySelector],
      html: `<ch-entity-selector></ch-entity-selector>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-entity-selector>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-entity-selector>
    `);
  });
});
