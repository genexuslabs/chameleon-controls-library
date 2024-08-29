import { NavigationListModel } from "../../../../components/navigation-list/types";

export const unanimoShowcase: NavigationListModel = [
  {
    caption: "Controls",
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/projects.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Button",
        items: [
          { caption: "Primary button", link: { url: "#" } },
          { caption: "Secondary button", link: { url: "#" } },
          { caption: "Tertiary button", link: { url: "#" } },
          { caption: "Rounded button", link: { url: "#" } }
        ]
      },
      {
        caption: "Grid",
        items: [
          { caption: "Standard grid", link: { url: "#" } },
          { caption: "Horizontal grid", link: { url: "#" } },
          { caption: "Tabular grid", link: { url: "#" } }
        ]
      },
      {
        caption: "Attribute/Variable",
        items: [
          { caption: "Check Box", link: { url: "#" } },
          { caption: "Combo Box", link: { url: "#" } },
          { caption: "Date Picker", link: { url: "#" } },
          { caption: "Edit", link: { url: "#" } },
          { caption: "Radio Button", link: { url: "#" } },
          { caption: "Slider", link: { url: "#" } },
          { caption: "Switch", link: { url: "#" } }
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
      "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/send.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Action Group",
        link: { url: "#" }
      },
      {
        caption: "Action Menu",
        link: { url: "#" }
      },
      {
        caption: "Breadcrumb",
        link: { url: "#" }
      },
      {
        caption: "Tab",
        link: { url: "#" }
      }
    ]
  },
  {
    caption: "Interaction",
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/profile.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Alert",
        link: { url: "#" }
      },
      {
        caption: "Progress Bar",
        link: { url: "#" }
      }
    ]
  },
  { id: "Show more", caption: "Show more" }
];
