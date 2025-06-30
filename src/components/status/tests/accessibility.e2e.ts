import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-status][basic]", () => {
  let page: E2EPage;
  let statusRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-status></ch-status>`,
      failOnConsoleError: true
    });
    statusRef = await page.find("ch-status");
  });

  it("should set aria-live to polite", async () => {
    const ariaLive = await statusRef.getAttribute("aria-live");
    expect(ariaLive).toBe("polite");
  });

  it("should set role to status", async () => {
    const role = await statusRef.getAttribute("role");
    expect(role).toBe("status");
  });
});
