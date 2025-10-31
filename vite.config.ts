import chokidar from "chokidar";
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const stencilEsmPath = resolve(__dirname, "dist/esm");

export default defineConfig({
  build: {
    // Only for debug
    outDir: "dist-vite",
    emptyOutDir: true
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "./src/showcase/", dest: "" }]
    }),
    {
      name: "reload-page-when-stencil-build-changes",
      configureServer(server) {
        // Allow Vite to read files outside the root
        server.config.server.fs = {
          ...server.config.server.fs,
          allow: [stencilEsmPath, ...server.config.server.fs.allow]
        };

        // Watch Stencil dist
        chokidar
          .watch(stencilEsmPath, { ignoreInitial: true })
          .on("all", async () => {
            // Invalidate all modules imported from dist/esm
            const modules = [
              ...server.moduleGraph.fileToModulesMap.keys()
            ].filter(f => f.startsWith(stencilEsmPath));

            modules.forEach(id => {
              const mods = server.moduleGraph.getModulesByFile(id);
              if (mods) {
                mods.forEach(m => server.moduleGraph.invalidateModule(m));
              }
            });

            // Reload the browser
            server.ws.send({ type: "full-reload" });
          });
      }
    }
  ]
});
