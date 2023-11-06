if (!document.getElementById("chameleon.nomodule")) {
  var script1 = document.createElement("script");
  script1.setAttribute("id", "chameleon.nomodule");
  script1.setAttribute("src", "Unanimo_chameleon/chameleon.js?20231025");
  script1.setAttribute("nomodule", "");
  document.head.appendChild(script1);
}

if (!document.getElementById("chameleon.module")) {
  var script2 = document.createElement("script");
  script2.setAttribute("id", "chameleon.module");
  script2.setAttribute("src", "Unanimo_chameleon/chameleon.esm.js?20231025");
  script2.setAttribute("type", "module");
  document.head.appendChild(script2);
}
