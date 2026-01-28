import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";

const webComponentsPaths = {
  checkbox: () => import("../../components/checkbox/checkbox.lit"),
  code: () => import("../../components/code/code.lit"),
  image: () => import("../../components/image/image.lit"),
  "layout-splitter": () =>
    import("../../components/layout-splitter/layout-splitter.lit"),
  "navigation-list-render": () =>
    import("../../components/navigation-list/navigation-list-render.lit"),
  "performance-scan": () =>
    import("../../components/performance-scan/performance-scan.lit"),
  "playground-editor": () =>
    import("../../components/playground-editor/playground-editor.lit"),
  progress: () => import("../../components/progress/progress.lit"),
  router: () => import("../../components/router/router.lit"),
  qr: () => import("../../components/qr/qr.lit"),
  "radio-group-render": () =>
    import("../../components/radio-group/radio-group-render.lit"),
  "segmented-control-render": () =>
    import("../../components/segmented-control/segmented-control-render.lit"),
  "showcase-api": () =>
    import("../../components/showcase/showcase-api/showcase-api.lit"),
  sidebar: () => import("../../components/sidebar/sidebar.lit"),
  slider: () => import("../../components/slider/slider.lit"),
  switch: () => import("../../components/switch/switch.lit"),
  "tabular-grid": () =>
    import("../../components/tabular-grid/tabular-grid-render.lit"),
  textblock: () => import("../../components/textblock/textblock.lit"),
  theme: () => import("../../components/theme/theme.lit")
} as const;

const chameleonComponentToBundleMapping = {
  "ch-code": webComponentsPaths.code,
  "ch-checkbox": webComponentsPaths.checkbox,
  "ch-image": webComponentsPaths.image,
  "ch-layout-splitter": webComponentsPaths["layout-splitter"],
  "ch-navigation-list-render": webComponentsPaths["navigation-list-render"],
  "ch-performance-scan": webComponentsPaths["performance-scan"],
  "ch-playground-editor": webComponentsPaths["playground-editor"],
  "ch-progress": webComponentsPaths.progress,
  "ch-qr": webComponentsPaths.qr,
  "ch-radio-group-render": webComponentsPaths["radio-group-render"],
  "ch-router": webComponentsPaths.router,
  "ch-segmented-control-render": webComponentsPaths["segmented-control-render"],
  "ch-sidebar": webComponentsPaths.sidebar,
  "ch-slider": webComponentsPaths.slider,
  "ch-showcase-api": webComponentsPaths["showcase-api"],
  "ch-switch": webComponentsPaths.switch,
  "ch-tabular-grid-render": webComponentsPaths.textblock,
  "ch-textblock": webComponentsPaths.textblock,
  "ch-theme": webComponentsPaths.theme
} as const satisfies Record<
  ChameleonPublicControlsTagName,
  () => Promise<unknown>
>;

export const getChameleonComponentPath = (
  element: ChameleonPublicControlsTagName
) => {
  const lazyLoadFunction =
    chameleonComponentToBundleMapping[
      element as keyof typeof chameleonComponentToBundleMapping
    ];

  return lazyLoadFunction ? lazyLoadFunction() : undefined;
};

