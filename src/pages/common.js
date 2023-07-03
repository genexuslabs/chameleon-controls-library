/*Toggle dir*/
const toggleDirBtn = document.getElementById("toggle-dir-btn");
toggleDirBtn.addEventListener("click", function () {
  const html = document.querySelector("html");
  const dir = html.getAttribute("dir");
  if (dir === "ltr") {
    html.setAttribute("dir", "rtl");
  } else {
    html.setAttribute("dir", "ltr");
  }
});
/*Toggle styles*/
const toggleStylesBtn = document.getElementById("toggle-styles-btn");
toggleStylesBtn.addEventListener("click", function () {
  console.log("hola");
  const body = document.querySelector("body");
  body.classList.toggle("styles");
});
/*Toggle Parts */
const togglePartsBtn = document.getElementById("toggle-parts-btn");
togglePartsBtn.addEventListener("click", function () {
  console.log("parts");
  const html = document.querySelector("html");
  html.classList.toggle("show-parts");
});
const partialTagName = "ch-";
const chComponents = Array.from(document.getElementsByTagName("*")).filter(
  element => element.tagName.toLowerCase().includes(partialTagName)
);
window.addEventListener("appload", () => {
  chComponents.forEach((chComponent, i) => {
    const elementsWithPart = chComponent.shadowRoot.querySelectorAll("[part]");
    elementsWithPart.forEach(elementWithPart => {
      const actualPart = elementWithPart.part.value;
      if (!actualPart.includes("part")) {
        elementWithPart.part = `part ${actualPart}`;
      }
    });
  });
});
