// import { defineCustomElements } from "@genexus/chameleon-controls-library-lit";
import "@genexus/chameleon-controls-library-lit/components/navigation-list-render.js";
import { html, render } from "lit";
import type { NavigationListModel } from "../../chameleon/dist/browser/development/components/navigation-list/types";

// defineCustomElements();

const navigationListModel: NavigationListModel = [];
const navigationListModel2: NavigationListModel = [];

for (let index = 0; index < window.benchmarkSize; index++) {
  navigationListModel.push({ id: `id-${index}`, caption: `id-${index}` });
}

const delayUntilAllComponentsDidLoaded = () =>
  new Promise(resolve => requestAnimationFrame(resolve));

// render(
//   html`<ch-navigation-list-render></ch-navigation-list-render>`,
//   document.querySelector("div")!
// );

// await new Promise(resolve => setTimeout(resolve, 120));

render(
  html`<ch-navigation-list-render
    .model=${navigationListModel}
  ></ch-navigation-list-render>`,
  document.querySelector("div")!
);
// await document.querySelector("ch-navigation-list-render")!.updateComplete;

await delayUntilAllComponentsDidLoaded();

await document.querySelector("ch-navigation-list-render")!.shadowRoot!
  .lastElementChild!.updateComplete;
await delayUntilAllComponentsDidLoaded();
await delayUntilAllComponentsDidLoaded();

navigationListModel.forEach((item, index) => {
  item.caption = `id-${index}-asd`;
});

performance.mark("initial-render-start");

document.querySelector("ch-navigation-list-render")!.requestUpdate();

await delayUntilAllComponentsDidLoaded();

performance.mark("initial-render-end");
performance.measure("render", "initial-render-start", "initial-render-end");

// window.tachometerResult =
//   (await performance.measureUserAgentSpecificMemory()).bytes / 1024 / 1024;
window.tachometerResult = performance.getEntriesByName("render")[0].duration;

// const memorySample = await performance.measureUserAgentSpecificMemory();
// console.log(memorySample.bytes / 1024 / 1024);
// window.tachometerResult = performance.memory.usedJSHeapSize / 1024;
