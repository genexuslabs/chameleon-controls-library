import { newE2EPage } from '@stencil/core/testing';

describe('ch-counter', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ch-counter></ch-counter>');

    const element = await page.find('ch-counter');
    expect(element).toHaveClass('hydrated');
  });
});
