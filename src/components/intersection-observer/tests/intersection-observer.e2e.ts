import { newE2EPage } from "@stencil/core/testing";

describe.skip("ch-intersection-observer", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-intersection-observer></ch-intersection-observer>"
    );

    const element = await page.find("ch-intersection-observer");
    expect(element).toHaveClass("hydrated");
  });

  it("trigger intersectionUpdate event when component enter in viewPort", async () => {
    const page = await newE2EPage();
    await page.setContent(
      ' <div style = "background-color: cornsilk; height: 1000px; width: 500px"></div><ch-intersection-observer></ch-intersection-observer>'
    );
    const intersectionUpdate = await page.spyOnEvent(
      "intersectionUpdate",
      "document"
    );
    await page.mouse.wheel({ deltaY: 1200 });
    await page.waitForChanges();
    expect(intersectionUpdate).toHaveReceivedEvent();
  });

  it("display slot content when is set", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-intersection-observer><h1>Some title</h1></ch-intersection-observer>"
    );
    const el = await page.find("ch-intersection-observer h1");
    expect(el).not.toBeNull();
  });

  it("class sticky is correctly applied to component, the component still in viewport when user scroll down", async () => {
    const page = await newE2EPage();
    await page.setContent(`<style>
      .sticky{
        position: sticky;
        top: 0;
      }
      </style>
    <div style="height: 1000px"></div>
    <div style="height: 2000px">
    <ch-intersection-observer>
      <div slot="content" style="height: 200px; width: 200px" class="sticky"> </div>
    </ch-intersection-observer>
    <div>
     `);
    const el = await page.find("ch-intersection-observer");
    const invisible = await el.isIntersectingViewport();
    expect(invisible).toBeFalsy();
    await page.mouse.wheel({ deltaY: 2500 });
    await page.waitForChanges();
    const visible = await el.isIntersectingViewport();
    expect(visible).toBeTruthy();
  });

  it("trigger intersectionUpdate event every time that overlay a threshold value when threshold property is set", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <div style="height: 1000px; width: 500px" > </div>
    <ch-intersection-observer threshold="0%,100%">
      <div slot="content" style="height: 500px; width: 200px"></div>
    </ch-intersection-observer>
    <div style="height: 1000px; width: 500px" > </div>
    `);
    const intersectionUpdate = await page.spyOnEvent(
      "intersectionUpdate",
      "document"
    );
    await page.mouse.wheel({ deltaY: 1800 });
    await page.waitForChanges();
    expect(intersectionUpdate).toHaveReceivedEventTimes(2);
  });

  it("trigger intersectionUpdate 200px before the component is in viewport when topMargin property is set", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <div style="height: 1000px; width: 500px" > </div>
    <ch-intersection-observer top-margin="300dip" bottom-margin="300dip">
      <div slot="content" style="height: 500px; width: 200px"></div>
    </ch-intersection-observer>
    <div style="height: 1000px; width: 500px" > </div>
    `);
    const intersectionComponent = await page.find("ch-intersection-observer");
    const intersectionUpdate = await page.spyOnEvent(
      "intersectionUpdate",
      "document"
    );
    await page.mouse.wheel({ deltaY: 200 });
    await page.waitForChanges();
    const isIntersecting = await intersectionComponent.isIntersectingViewport();
    expect(isIntersecting).toBeFalsy();
    expect(intersectionUpdate).toHaveReceivedEvent();
  });

  it("recieve the correct IntersectionUpdate detail parameter values", async () => {
    const page = await newE2EPage();
    await page.setContent(`
    <div style="height: 1000px; width: 500px" > </div>
    <ch-intersection-observer>
      <div slot="content" style="height: 500px; width: 200px"></div>
    </ch-intersection-observer>
    <div style="height: 1000px; width: 500px" > </div>
    `);
    const intersectionUpdate = await page.spyOnEvent(
      "intersectionUpdate",
      "document"
    );
    await page.mouse.wheel({ deltaY: 600 });
    await page.waitForChanges();
    expect(intersectionUpdate.lastEvent.detail).toHaveProperty(
      "isIntersecting",
      true
    );
  });
});
