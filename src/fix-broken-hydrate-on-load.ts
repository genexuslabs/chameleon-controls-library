// This is a WA to fix a breaking change that StencilJS did in the patch tag: 4.25.2
// https://github.com/stenciljs/core/issues/6091
window.addEventListener(
  "appload",
  () => {
    // Ensure we are not in a server environment
    if (typeof window !== "undefined") {
      // Wait until the next frame to perform the layout update
      requestAnimationFrame(() =>
        document.documentElement.classList.add("hydrated")
      );
    }
  },
  { once: true }
);
