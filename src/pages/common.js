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
