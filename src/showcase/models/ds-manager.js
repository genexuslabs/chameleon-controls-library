const DS_MANAGER_LANGUAGE_KEY = "chameleon-design-system";
const UNANIMO_DS =
  "https://unpkg.com/@genexus/unanimo@latest/dist/bundles/css/all.css";
const MERCURY_DS =
  "https://unpkg.com/@genexus/mercury@latest/dist/bundles/css/all.css";

const CURRENT_DS_SELECTOR = "data-selected-ds";
const CURRENT_DS_ATTRIBUTE_SELECTOR = `[${CURRENT_DS_SELECTOR}]`;

const DS_MAPPING = {
  unanimo: UNANIMO_DS,
  mercury: MERCURY_DS
};

const DEFAULT_DS = "unanimo";

export const getDesignSystem = () =>
  localStorage.getItem(DS_MANAGER_LANGUAGE_KEY);

export function storeDesignSystem(designSystem) {
  localStorage.setItem(DS_MANAGER_LANGUAGE_KEY, designSystem);
}

export function setDesignSystemInBrowser(designSystem) {
  let styleSheetLink = document.head.querySelector(
    CURRENT_DS_ATTRIBUTE_SELECTOR
  );
  const dsURL = DS_MAPPING[designSystem];

  // Update the selected DS
  if (styleSheetLink) {
    styleSheetLink.setAttribute("href", dsURL);
    styleSheetLink.setAttribute(CURRENT_DS_SELECTOR, designSystem);
  }
  // Initialize the DS
  else {
    document.body.style.display = "none"; // Necessary to avoid FOUC

    styleSheetLink = document.createElement("link");
    styleSheetLink.setAttribute("href", dsURL);
    styleSheetLink.setAttribute(CURRENT_DS_SELECTOR, designSystem);
    styleSheetLink.setAttribute("rel", "stylesheet");
    styleSheetLink.setAttribute("crossorigin", "anonymous");
    styleSheetLink.setAttribute("referrerpolicy", "no-referrer");
    styleSheetLink.addEventListener("load", () => {
      document.body.style.display = null; // Make visible the body again
    });

    document.head.appendChild(styleSheetLink);
  }

  document.body.classList = designSystem;
}

// Initialize the design system
const designSystem = getDesignSystem();

if (!designSystem) {
  storeDesignSystem(DEFAULT_DS);
}
