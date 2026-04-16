import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";

const webComponentsPaths = {
  "accordion-render": () => import("../../components/accordion/accordion.lit"),
  "action-group-render": () =>
    import("../../components/action-group/action-group-render.lit"),
  "action-list-render": () =>
    import("../../components/action-list/action-list-render.lit"),
  "action-menu-render": () =>
    import("../../components/action-menu/action-menu-render.lit"),
  checkbox: () => import("../../components/checkbox/checkbox.lit"),
  code: () => import("../../components/code/code.lit"),
  "combo-box-render": () => import("../../components/combo-box/combo-box.lit"),
  image: () => import("../../components/image/image.lit"),
  "layout-splitter": () =>
    import("../../components/layout-splitter/layout-splitter.lit"),
  "math-viewer": () => import("../../components/math-viewer/math-viewer.lit"),
  "navigation-list-render": () =>
    import("../../components/navigation-list/navigation-list-render.lit"),
  "performance-scan": () =>
    import("../../components/performance-scan/performance-scan.lit"),
  "playground-editor": () =>
    import("../../components/playground-editor/playground-editor.lit"),
  popover: () => import("../../components/popover/popover.lit"),
  progress: () => import("../../components/progress/progress.lit"),
  router: () => import("../../components/router/router.lit"),
  qr: () => import("../../components/qr/qr.lit"),
  "radio-group-render": () =>
    import("../../components/radio-group/radio-group-render.lit"),
  reasoning: () => import("../../components/reasoning/reasoning.lit"),
  "segmented-control-render": () =>
    import("../../components/segmented-control/segmented-control-render.lit"),
  "showcase-api": () =>
    import("../../components/showcase/showcase-api/showcase-api.lit"),
  sidebar: () => import("../../components/sidebar/sidebar.lit"),
  slider: () => import("../../components/slider/slider.lit"),
  status: () => import("../../components/status/status.lit"),
  switch: () => import("../../components/switch/switch.lit"),
  "tab-render": () => import("../../components/tab/tab.lit"),
  "tabular-grid": () =>
    import("../../components/tabular-grid/tabular-grid-render.lit"),
  textblock: () => import("../../components/textblock/textblock.lit"),
  theme: () => import("../../components/theme/theme.lit"),
  "breadcrumb-render": () =>
    import("../../components/breadcrumb/breadcrumb-render.lit"),
  "ch-chat": () => import("../../components/chat/chat.lit"),
  "ch-edit": () => import("../../components/edit/edit"),
} as const;

const chameleonComponentToBundleMapping = {
  "ch-accordion-render": webComponentsPaths["accordion-render"],
  "ch-action-group-render": webComponentsPaths["action-group-render"],
  "ch-action-list-render": webComponentsPaths["action-list-render"],
  "ch-action-menu-render": webComponentsPaths["action-menu-render"],
  "ch-code": webComponentsPaths.code,
  "ch-checkbox": webComponentsPaths.checkbox,
  "ch-combo-box-render": webComponentsPaths["combo-box-render"],
  "ch-image": webComponentsPaths.image,
  "ch-layout-splitter": webComponentsPaths["layout-splitter"],
  "ch-math-viewer": webComponentsPaths["math-viewer"],
  "ch-navigation-list-render": webComponentsPaths["navigation-list-render"],
  "ch-performance-scan": webComponentsPaths["performance-scan"],
  "ch-playground-editor": webComponentsPaths["playground-editor"],
  "ch-popover": webComponentsPaths.popover,
  "ch-progress": webComponentsPaths.progress,
  "ch-qr": webComponentsPaths.qr,
  "ch-radio-group-render": webComponentsPaths["radio-group-render"],
  "ch-reasoning": webComponentsPaths.reasoning,
  "ch-router": webComponentsPaths.router,
  "ch-segmented-control-render": webComponentsPaths["segmented-control-render"],
  "ch-sidebar": webComponentsPaths.sidebar,
  "ch-slider": webComponentsPaths.slider,
  "ch-showcase-api": webComponentsPaths["showcase-api"],
  "ch-status": webComponentsPaths.status,
  "ch-switch": webComponentsPaths.switch,
  "ch-tab-render": webComponentsPaths["tab-render"],
  "ch-tabular-grid-render": webComponentsPaths.textblock,
  "ch-textblock": webComponentsPaths.textblock,
  "ch-theme": webComponentsPaths.theme,
  "ch-breadcrumb-render": webComponentsPaths["breadcrumb-render"],
  "ch-chat": webComponentsPaths["ch-chat"],
  "ch-edit": webComponentsPaths["ch-edit"],
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

