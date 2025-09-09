import { NavigationListModel } from "../../../../components/navigation-list/types";

export const unanimoShowcase: NavigationListModel = [
  {
    caption: "Controls",
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@0.25.0/dist/assets/icons/projects.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Button",
        items: [
          {
            caption: "Primary button",
            link: { url: "#primary-button", target: "_blank", rel: "nofollow" }
          },
          { caption: "Secondary button", link: { url: "#secondary-button" } },
          { caption: "Tertiary button", link: { url: "#tertiary-button" } },
          { caption: "Rounded button", link: { url: "#rounded-button" } }
        ]
      },
      {
        caption: "Grid",
        items: [
          { caption: "Standard grid", link: { url: "#standard-grid" } },
          { caption: "Horizontal grid", link: { url: "#horizontal-grid" } },
          { caption: "Tabular grid", link: { url: "#tabular-grid" } }
        ]
      },
      {
        caption: "Attribute/Variable",
        items: [
          { caption: "Check Box", link: { url: "#checkbox" } },
          { caption: "Combo Box", link: { url: "#combo-box" } },
          { caption: "Date Picker", link: { url: "#date-picker" } },
          { caption: "Edit", link: { url: "#edit" } },
          { caption: "Radio Button", link: { url: "#radio-button" } },
          { caption: "Slider", link: { url: "#slider" } },
          { caption: "Switch", link: { url: "#switch" } }
        ]
      },
      {
        caption: "TextBlock"
      }
    ]
  },
  {
    caption: "Navigation",
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@0.25.0/dist/assets/icons/send.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Action Group",
        link: { url: "#action-group" }
      },
      {
        caption: "Action Menu",
        link: { url: "#action-menu" }
      },
      {
        caption: "Breadcrumb",
        link: { url: "#breadcrumb" }
      },
      {
        caption: "Tab",
        link: { url: "#tab" }
      }
    ]
  },
  {
    caption: "Interaction",
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@0.25.0/dist/assets/icons/profile.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Alert",
        link: { url: "#alert" }
      },
      {
        caption: "Progress Bar",
        link: { url: "#progress-bar" }
      }
    ]
  },
  { id: "Show more", caption: "Show more" }
];
