/**
 * Builds the NavigationListModel for the sidebar navigation.
 * Groups components by category with links to their overview pages.
 */
import type { NavigationListModel } from "../../src/components/navigation-list/types";
import {
  getComponentDisplayName,
  getComponentSlug,
  getPublicComponents
} from "./component-registry";

type ComponentCategory = {
  caption: string;
  tags: string[];
};

// Component categories for sidebar grouping
const CATEGORIES: ComponentCategory[] = [
  {
    caption: "Form",
    tags: [
      "ch-checkbox",
      "ch-combo-box-render",
      "ch-edit",
      "ch-radio-group-render",
      "ch-slider",
      "ch-switch"
    ]
  },
  {
    caption: "Data",
    tags: [
      "ch-code",
      "ch-image",
      "ch-math-viewer",
      "ch-qr",
      "ch-status",
      "ch-textblock",
      "ch-progress",
      "ch-tabular-grid-render"
    ]
  },
  {
    caption: "Layout",
    tags: [
      "ch-accordion-render",
      "ch-layout-splitter",
      "ch-popover",
      "ch-sidebar",
      "ch-tab-render"
    ]
  },
  {
    caption: "Navigation",
    tags: [
      "ch-action-group-render",
      "ch-action-list-render",
      "ch-action-menu-render",
      "ch-breadcrumb-render",
      "ch-navigation-list-render",
      "ch-segmented-control-render"
    ]
  },
  {
    caption: "Theming",
    tags: ["ch-theme"]
  }
];

/**
 * Builds the full sidebar navigation model.
 */
export function buildNavigationModel(): NavigationListModel {
  const publicTags = new Set(getPublicComponents().map(c => c.tagName));

  return [
    {
      id: "getting-started",
      caption: "Getting Started",
      link: { url: "/getting-started" }
    },
    {
      id: "json-render",
      caption: "ch-json-render",
      link: { url: "/json-render" }
    },
    ...CATEGORIES.map(category => ({
      id: `category-${category.caption.toLowerCase()}`,
      caption: category.caption,
      expanded: true,
      items: category.tags
        .filter(tag => publicTags.has(tag))
        .map(tag => ({
          id: tag,
          caption: getComponentDisplayName(tag),
          link: { url: `/components/${getComponentSlug(tag)}/overview` }
        }))
    })).filter(category => category.items.length > 0)
  ];
}
