import { NavigationListModel } from "../../../../components/navigation-list/types";

export const unanimoShowcase: NavigationListModel = [
  {
    caption: "Controls",
    items: [
      {
        caption: "Button",
        items: [
          { caption: "Primary button" },
          { caption: "Secondary button" },
          { caption: "Tertiary button" },
          { caption: "Rounded button" }
        ]
      },
      {
        caption: "Grid",
        items: [
          { caption: "Standard grid" },
          { caption: "Horizontal grid" },
          { caption: "Tabular grid" }
        ]
      },
      {
        caption: "Attribute/Variable",
        items: [
          { caption: "Check Box" },
          { caption: "Combo Box" },
          { caption: "Date Picker" },
          { caption: "Edit" },
          { caption: "Radio Button" },
          { caption: "Slider" },
          { caption: "Switch" }
        ]
      },
      {
        caption: "TextBlock"
      }
    ]
  },
  {
    caption: "Navigation",
    items: [
      {
        caption: "Action Group"
      },
      {
        caption: "Action Menu"
      },
      {
        caption: "Breadcrumb"
      },
      {
        caption: "Tab"
      }
    ]
  },
  {
    caption: "Interaction",
    items: [
      {
        caption: "Alert"
      },
      {
        caption: "Progress Bar"
      }
    ]
  }
];
