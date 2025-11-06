// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// This script initiates a development environment for the web components
// package by performing the following steps:
// 1️⃣ Starts the Stencil build process in watch mode to compile web components.
// 2️⃣ Waits for the initial build to complete by checking for the existence
//    of the loader file.
// 3️⃣ Once the loader file is detected, it starts the Vite development server
//    to serve the web components.
//
// Additionally, the script listens for user input to gracefully terminate
// all spawned processes when the user types 'q' followed by Enter.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import os from "os";

const loaderPath = "./loader/index.js";
const processes = [];

// Wait until Stencil has built the initial files
function waitForInitialStencilBuildToBeReady(filePath, interval = 100) {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (existsSync(filePath)) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}

// Terminate all spawned processes cross-platform
function terminateProcesses() {
  console.log("\n[dev] Terminating all processes...");

  const isWindows = os.platform() === "win32";

  processes.forEach(p => {
    if (p && p.pid) {
      try {
        if (isWindows) {
          // Windows: kill process and all child processes
          execSync(`taskkill /PID ${p.pid} /T /F`);
        } else {
          // Unix/macOS: kill the entire process group
          process.kill(-p.pid, "SIGTERM");
        }
      } catch (err) {
        console.warn(`[dev] Could not kill process ${p.pid}:`, err);
      }
    }
  });

  process.exit(0);
}

// Listen for 'q' + Enter
process.stdin.setEncoding("utf-8");
process.stdin.on("data", data => {
  if (data.trim().toLowerCase() === "q") {
    terminateProcesses();
  }
});
process.stdin.resume();

// 1️⃣ Start Stencil in watch mode
const stencilProcess = spawn("npm run watch:dev", {
  stdio: "inherit",
  shell: true,
  detached: os.platform() !== "win32" // detached only on Unix/macOS
});
processes.push(stencilProcess);

// 2️⃣ Wait until loader.js is created before starting Vite
(async () => {
  await waitForInitialStencilBuildToBeReady(loaderPath);

  const viteProcess = spawn("yarn start.vite", {
    stdio: "inherit",
    shell: true,
    detached: os.platform() !== "win32"
  });
  processes.push(viteProcess);
})();
