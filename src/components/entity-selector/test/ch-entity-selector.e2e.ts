import { newE2EPage } from '@stencil/core/testing';

describe('ch-entity-selector', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ch-entity-selector></ch-entity-selector>');

    const element = await page.find('ch-entity-selector');
    expect(element).toHaveClass('hydrated');
  });
});
