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
      "ch-qr",
      "ch-textblock",
      "ch-progress",
      "ch-tabular-grid-render"
    ]
  },
  {
    caption: "Layout",
    tags: ["ch-layout-splitter", "ch-sidebar"]
  },
  {
    caption: "Navigation",
    tags: [
      "ch-navigation-list-render",
      "ch-segmented-control-render",
      "ch-breadcrumb-render"
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
