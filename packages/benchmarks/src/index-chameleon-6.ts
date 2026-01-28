import { defineCustomElements } from "@genexus/chameleon-controls-library/loader";
import { html, render } from "lit";
import type { NavigationListModel } from "../../chameleon/dist/browser/development/components/navigation-list/types";

defineCustomElements();

const navigationListModel: NavigationListModel = [];
const navigationListModel2: NavigationListModel = [];

for (let index = 0; index < window.benchmarkSize; index++) {
  navigationListModel.push({ id: `id-${index}`, caption: `id-${index}` });
  navigationListModel2.push({
    id: `id-${index}`,
    caption: `id-${index}-asd`
  });
}

// await new Promise(resolve => {
//   window.addEventListener("appload", () => {
//     resolve();
//     console.log("appload");
//   });
// });

const delayUntilAllComponentsDidLoaded = () =>
  new Promise(resolve => requestAnimationFrame(resolve));

// render(
//   html`<ch-navigation-list-render
//     .model=${[{ id: `0`, caption: `0` }]}
//   ></ch-navigation-list-render>`,
//   document.querySelector("div")!
// );

// await new Promise(resolve => setTimeout(resolve, 220));

render(
  html`<ch-navigation-list-render
    .model=${navigationListModel}
  ></ch-navigation-list-render>`,
  document.querySelector("div")!
);

await delayUntilAllComponentsDidLoaded();

window.addEventListener("appload", async () => {
  await delayUntilAllComponentsDidLoaded();
  await delayUntilAllComponentsDidLoaded();
  await delayUntilAllComponentsDidLoaded();

  performance.mark("initial-render-start");

  document.querySelector("ch-navigation-list-render")!.model =
    navigationListModel2;
  await delayUntilAllComponentsDidLoaded();
  await delayUntilAllComponentsDidLoaded();

  performance.mark("initial-render-end");
  performance.measure("render", "initial-render-start", "initial-render-end");

  // window.tachometerResult =
  //   (await performance.measureUserAgentSpecificMemory()).bytes / 1024 / 1024;
  window.tachometerResult = performance.getEntriesByName("render")[0].duration;
});
// const memorySample = await performance.measureUserAgentSpecificMemory();
// console.log(memorySample.bytes / 1024 / 1024);
// window.tachometerResult = performance.memory.usedJSHeapSize / 1024;
