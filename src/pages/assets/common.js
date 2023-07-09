const html = document.querySelector("html");
const body = document.querySelector("body");
const head = document.querySelector("head");

/**************
HEAD
***************/
function setFavicon(favImgSrc) {
  let setFavicon = document.createElement("link");
  setFavicon.setAttribute("rel", "shortcut icon");
  setFavicon.setAttribute("href", favImgSrc);
  head.appendChild(setFavicon);
}
setFavicon("./assets/ch.ico");

/**************
HEADER
***************/
const noPartSelected = "No part selected.";
/*header*/
const headerDev = document.createElement("header");
headerDev.classList.add("header-dev");
/*header main*/
const headerMain = document.createElement("div");
headerMain.classList.add("header-dev__main");
/*header parts*/
const headerParts = document.createElement("div");
headerParts.classList.add("header-dev__parts");
headerPartsTitle = document.createElement("span");
headerPartsTitle.classList.add("header-dev__parts-title");
headerPartsTitle.innerText = "Select a part:";
headerPartsSelected = document.createElement("span");
headerPartsSelected.classList.add("header-dev__parts-selected");
headerPartsSelected.innerText = noPartSelected;
/*header title*/
const headerTitle = document.createElement("span");
headerTitle.classList.add("header-dev__title");
const htmlTitle = document.title;
if (htmlTitle) {
  headerTitle.innerText = htmlTitle;
} else {
  headerTitle.innerText = 'Please, add a "title" to the page.';
}
/*buttons group*/
const headerButtonsGroup = document.createElement("div");
headerButtonsGroup.classList.add("header-dev__buttons-group");

/*************************
HEADER > Toggle RTL Button
/*************************/
const toggleRtlBtn = document.createElement("button");
toggleRtlBtn.classList.add("header-dev__button");
toggleRtlBtn.innerText = "Toggle RTL";
const toggleRtlBtnActiveClass = () => {
  if (html.getAttribute("dir") === "rtl") {
    toggleRtlBtn.classList.add("active");
  } else {
    toggleRtlBtn.classList.remove("active");
  }
};
toggleRtlBtnActiveClass();
const toggleRtl = () => {
  const dir = html.getAttribute("dir");
  if (dir === "ltr") {
    html.setAttribute("dir", "rtl");
  } else {
    html.setAttribute("dir", "ltr");
  }
  toggleRtlBtnActiveClass();
};
toggleRtlBtn.addEventListener("click", toggleRtl);

/****************************
HEADER > Toggle Styles Button
/****************************/
body.classList.add("styles");
const toggleStylesBtn = document.createElement("button");
toggleStylesBtn.classList.add("header-dev__button");
toggleStylesBtn.innerText = "Toggle Styles";
const toggleStylesBtnActiveClass = () => {
  if (body.classList.contains("styles")) {
    toggleStylesBtn.classList.add("active");
  } else {
    toggleStylesBtn.classList.remove("active");
  }
};
toggleStylesBtnActiveClass();
toggleStylesBtn.addEventListener("click", function () {
  body.classList.toggle("styles");
  toggleStylesBtnActiveClass();
});

/***************************
HEADER > Toggle Parts Button
/***************************/
const togglePartsBtn = document.createElement("button");
togglePartsBtn.classList.add("header-dev__button");
togglePartsBtn.innerText = "Toggle Parts";
const togglePartsBtnActiveClass = () => {
  if (html.classList.contains("show-parts")) {
    togglePartsBtn.classList.add("active");
  } else {
    togglePartsBtn.classList.remove("active");
  }
};
togglePartsBtnActiveClass();
togglePartsBtn.addEventListener("click", function () {
  html.classList.toggle("show-parts");
  togglePartsBtnActiveClass();
});
const partialTagName = "ch-";
const chComponents = Array.from(document.getElementsByTagName("*")).filter(
  element => element.tagName.toLowerCase().includes(partialTagName)
);

/*APPEND ELEMENTS*/
/*Header main*/
headerMain.appendChild(headerTitle);
headerButtonsGroup.appendChild(toggleRtlBtn);
headerButtonsGroup.appendChild(togglePartsBtn);
headerButtonsGroup.appendChild(toggleStylesBtn);
headerMain.appendChild(headerButtonsGroup);
/*Header parts*/
headerParts.appendChild(headerPartsTitle);
headerParts.appendChild(headerPartsSelected);
headerDev.appendChild(headerMain);
headerDev.appendChild(headerParts);
body.prepend(headerDev);

/*********************************************
PARTS (Add 'part' part) to add styles to parts
/********************************************/
window.addEventListener("appload", () => {
  chComponents.forEach(chComponent => {
    const elementsWithPart = chComponent.shadowRoot?.querySelectorAll("[part]");
    if (elementsWithPart) {
      elementsWithPart.forEach(elementWithPart => {
        const actualParts = elementWithPart.part.value;
        if (!actualParts.includes("part")) {
          elementWithPart.part = `part ${actualParts}`;
        }
      });
    }
    const shadowRoot = chComponent.shadowRoot;
    const parts = shadowRoot.querySelectorAll(`*[part]`);
    parts.forEach(part => {
      part.addEventListener("mouseenter", function () {
        let partsArray = part
          .getAttribute("part")
          .split(" ")
          .filter(part => {
            return part !== "part";
          });
        headerPartsSelected.innerText = partsArray.join(" | ");
      });
      chComponent.addEventListener("mouseleave", function () {
        headerPartsSelected.innerText = noPartSelected;
      });
    });
  });
});

/**************
SECTIONS
***************/
/*.section-dev's provide an appealing way to visualize different separate cases of use for a component*/
const chSections = document.querySelectorAll(".section-dev");
if (chSections.length) {
  chSections.forEach(chSection => {
    /*title*/
    const title = chSection.getAttribute("data-title");
    if (title && title.length) {
      const titleEl = document.createElement("h2");
      titleEl.classList.add("section-dev__title");
      titleEl.innerText = title;
      chSection.prepend(titleEl);
    }
    /*set id*/
    chSection.setAttribute("id", title.replace(/\s+/g, "-").toLowerCase());
  });
}
