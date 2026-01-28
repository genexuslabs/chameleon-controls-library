import * as fsSync from "fs";
import { Stats } from "fs";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Interface for file information
 */
interface FileInfo {
  path: string;
  relativePath: string;
  stats: Stats;
  isDirectory: boolean;
}

/**
 * Configuration for sync targets
 */
interface SyncTarget {
  path: string;
  name: string;
  isServerTarget: boolean;
}

/**
 * This debounce value is useful to batch multiples updates attempts into a
 * single compilation. In some cases, multiples files can be changed at the
 * same time, so if we don't debounce the next compilation, we would trigger
 * two compilations, when in some cases only one is necessary.
 *
 * This case can also happen when performing ESLint on auto-save.
 */
const DEBOUNCE_MS = 30;

const CHAMELEON_DEV_FLAGS_FILE = "development-flags.ts";

const CLIENT_DEV_FLAGS = `export const DEV_MODE = true;
export const IS_SERVER = false;
`;
const SERVER_DEV_FLAGS = `export const DEV_MODE = true;
export const IS_SERVER = true;
`;

/**
 * Simple dual-target folder synchronizer
 * Syncs source folder to two target folders with different development-flags.ts content
 */
class DualTargetSynchronizer {
  private sourcePath: string;
  private clientTarget: SyncTarget;
  private serverTarget: SyncTarget;
  private watchers: fsSync.FSWatcher[] = [];
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor(
    sourcePath: string,
    clientTargetPath: string,
    serverTargetPath: string
  ) {
    this.sourcePath = path.resolve(sourcePath);
    this.clientTarget = {
      path: path.resolve(clientTargetPath),
      name: "Client",
      isServerTarget: false
    };
    this.serverTarget = {
      path: path.resolve(serverTargetPath),
      name: "Server",
      isServerTarget: true
    };

    // Setup cleanup on process exit
    this.setupCleanup();
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  private setupCleanup(): void {
    const cleanup = () => {
      if (this.isRunning) {
        this.stop();
      }
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);
  }

  /**
   * Start synchronization
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    console.log(
      `Starting dual-target sync: ${this.sourcePath} -> [${this.clientTarget.name}, ${this.serverTarget.name}]`
    );

    try {
      // Ensure target directories exist
      await this.ensureDirectory(this.clientTarget.path);
      await this.ensureDirectory(this.serverTarget.path);

      // Perform initial sync
      await this.performInitialSync();

      // Start watching
      await this.startWatching();

      this.isRunning = true;
      console.log("Dual-target synchronization started successfully");
    } catch (error) {
      console.error("Failed to start synchronization:", error);
      this.stop();
      throw error;
    }
  }

  /**
   * Stop synchronization and cleanup
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping dual-target synchronization...");

    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Close watchers
    this.watchers.forEach(watcher => {
      try {
        watcher.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    this.watchers = [];

    this.isRunning = false;
    console.log("Dual-target synchronization stopped");

    // Necessary to correctly stop the process. If not, we must kill the
    // terminal to start again the dev server
    process.exit(1);
  }

  /**
   * Perform initial synchronization to both targets
   */
  private async performInitialSync(): Promise<void> {
    console.log("Performing initial synchronization...");

    const sourceFiles = await this.scanDirectory(this.sourcePath);
    const clientFiles = await this.scanDirectory(this.clientTarget.path);

    // Sync to both targets
    await Promise.all([
      this.syncToTarget(sourceFiles, clientFiles, this.clientTarget),
      this.syncToTarget(sourceFiles, clientFiles, this.serverTarget)
    ]);

    console.log("Initial synchronization completed");
  }

  /**
   * Sync source files to a specific target
   */
  private async syncToTarget(
    sourceFiles: Map<string, FileInfo>,
    referenceFiles: Map<string, FileInfo>,
    target: SyncTarget
  ): Promise<void> {
    let operations = { created: 0, updated: 0, deleted: 0 };

    // Process source files (create/update)
    for (const [relativePath, sourceFile] of sourceFiles) {
      const referenceFile = referenceFiles.get(relativePath);

      if (sourceFile.isDirectory) {
        await this.syncDirectory(sourceFile, target);
        if (!referenceFile) operations.created++;
      } else {
        const wasUpdated = await this.syncFile(
          sourceFile,
          referenceFile,
          target
        );
        if (wasUpdated) {
          operations[referenceFile ? "updated" : "created"]++;
        }
      }
    }

    // Delete orphaned files
    for (const [relativePath, referenceFile] of referenceFiles) {
      if (!sourceFiles.has(relativePath)) {
        await this.deleteFromTarget(referenceFile, target);
        operations.deleted++;
      }
    }

    console.log(
      `[${target.name}] Created: ${operations.created}, Updated: ${operations.updated}, Deleted: ${operations.deleted}`
    );
  }

  /**
   * Sync a single file to target
   */
  private async syncFile(
    sourceFile: FileInfo,
    referenceFile: FileInfo | undefined,
    target: SyncTarget
  ): Promise<boolean> {
    const targetPath = path.join(target.path, sourceFile.relativePath);

    // Check if update is needed
    const needsUpdate =
      !referenceFile || sourceFile.stats.mtime > referenceFile.stats.mtime;

    if (!needsUpdate) {
      return false;
    }

    // Ensure target directory exists
    await this.ensureDirectory(path.dirname(targetPath));

    // Handle special case for development-flags.ts
    if (sourceFile.relativePath === CHAMELEON_DEV_FLAGS_FILE) {
      const content = target.isServerTarget
        ? SERVER_DEV_FLAGS
        : CLIENT_DEV_FLAGS;
      await fs.writeFile(targetPath, content, "utf8");
      console.log(
        `[${target.name}] Applied dev flags override: ${sourceFile.relativePath}`
      );
    } else {
      // Normal file copy
      await fs.copyFile(sourceFile.path, targetPath);

      // Preserve modification time
      await fs.utimes(
        targetPath,
        sourceFile.stats.atime,
        sourceFile.stats.mtime
      );
    }

    return true;
  }

  /**
   * Sync a directory to target
   */
  private async syncDirectory(
    sourceDir: FileInfo,
    target: SyncTarget
  ): Promise<void> {
    const targetPath = path.join(target.path, sourceDir.relativePath);
    await this.ensureDirectory(targetPath);

    // Preserve modification time
    await fs.utimes(targetPath, sourceDir.stats.atime, sourceDir.stats.mtime);
  }

  /**
   * Delete file or directory from target
   */
  private async deleteFromTarget(
    fileInfo: FileInfo,
    target: SyncTarget
  ): Promise<void> {
    const targetPath = path.join(target.path, fileInfo.relativePath);

    try {
      if (fileInfo.isDirectory) {
        await fs.rmdir(targetPath, { recursive: true });
      } else {
        await fs.unlink(targetPath);
      }
      console.log(`[${target.name}] Deleted: ${fileInfo.relativePath}`);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn(`[${target.name}] Failed to delete ${targetPath}:`, error);
      }
    }
  }

  /**
   * Start watching source directory for changes
   */
  private async startWatching(): Promise<void> {
    await this.watchDirectoryRecursive(this.sourcePath);
    console.log(`Started watching ${this.watchers.length} directories`);
  }

  /**
   * Watch a directory and all its subdirectories
   */
  private async watchDirectoryRecursive(dirPath: string): Promise<void> {
    try {
      // Use fsSync.watch instead of fs.watch to get the correct FSWatcher type
      const watcher = fsSync.watch(
        dirPath,
        { persistent: false },
        (_, filename) => {
          if (filename) {
            this.handleFileChange(path.join(dirPath, filename));
          }
        }
      );

      this.watchers.push(watcher);

      watcher.on("error", error => {
        console.error(`Watcher error for ${dirPath}:`, error);
        // Remove failed watcher from array
        const index = this.watchers.indexOf(watcher);
        if (index > -1) {
          this.watchers.splice(index, 1);
        }
      });

      // Watch subdirectories
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.watchDirectoryRecursive(path.join(dirPath, entry.name));
        }
      }
    } catch (error) {
      console.warn(`Could not watch directory ${dirPath}:`, error);
    }
  }

  /**
   * Handle file system change with debouncing
   */
  private handleFileChange(filePath: string): void {
    if (!this.isRunning) {
      return;
    }

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      await this.processFileChange(filePath);
    }, DEBOUNCE_MS);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process a file change event
   */
  private async processFileChange(filePath: string): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    const relativePath = path.relative(this.sourcePath, filePath);

    try {
      // Check if file still exists
      let sourceStats: Stats;
      try {
        sourceStats = await fs.stat(filePath);
      } catch (error) {
        // File was deleted
        await this.handleFileDeleted(relativePath);
        return;
      }

      const fileInfo: FileInfo = {
        path: filePath,
        relativePath,
        stats: sourceStats,
        isDirectory: sourceStats.isDirectory()
      };

      // Handle file creation/modification
      await this.handleFileChanged(fileInfo);

      // If it's a new directory, start watching it
      if (fileInfo.isDirectory) {
        await this.watchDirectoryRecursive(filePath);
      }
    } catch (error) {
      console.error(`Error processing change for ${filePath}:`, error);
    }
  }

  /**
   * Handle file creation or modification
   */
  private async handleFileChanged(fileInfo: FileInfo): Promise<void> {
    console.log(`Processing change: ${fileInfo.relativePath}`);

    // Sync to both targets
    await Promise.all([
      this.syncFileToTarget(fileInfo, this.clientTarget),
      this.syncFileToTarget(fileInfo, this.serverTarget)
    ]);
  }

  /**
   * Handle file deletion
   */
  private async handleFileDeleted(relativePath: string): Promise<void> {
    console.log(`Processing deletion: ${relativePath}`);

    // Delete from both targets
    await Promise.all([
      this.deleteFileFromTarget(relativePath, this.clientTarget),
      this.deleteFileFromTarget(relativePath, this.serverTarget)
    ]);
  }

  /**
   * Sync a single file to a specific target
   */
  private async syncFileToTarget(
    fileInfo: FileInfo,
    target: SyncTarget
  ): Promise<void> {
    const targetPath = path.join(target.path, fileInfo.relativePath);

    if (fileInfo.isDirectory) {
      await this.ensureDirectory(targetPath);
      await fs.utimes(targetPath, fileInfo.stats.atime, fileInfo.stats.mtime);
    } else {
      await this.ensureDirectory(path.dirname(targetPath));

      // Handle special case for development-flags.ts
      if (fileInfo.relativePath === CHAMELEON_DEV_FLAGS_FILE) {
        const content = target.isServerTarget
          ? SERVER_DEV_FLAGS
          : CLIENT_DEV_FLAGS;
        await fs.writeFile(targetPath, content, "utf8");
        console.log(
          `[${target.name}] Applied dev flags override: ${fileInfo.relativePath}`
        );
      } else {
        await fs.copyFile(fileInfo.path, targetPath);
        await fs.utimes(targetPath, fileInfo.stats.atime, fileInfo.stats.mtime);
      }
    }

    console.log(`[${target.name}] Synced: ${fileInfo.relativePath}`);
  }

  /**
   * Delete a file from a specific target
   */
  private async deleteFileFromTarget(
    relativePath: string,
    target: SyncTarget
  ): Promise<void> {
    const targetPath = path.join(target.path, relativePath);

    try {
      const stats = await fs.stat(targetPath);

      if (stats.isDirectory()) {
        await fs.rmdir(targetPath, { recursive: true });
      } else {
        await fs.unlink(targetPath);
      }

      console.log(`[${target.name}] Deleted: ${relativePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn(`[${target.name}] Failed to delete ${targetPath}:`, error);
      }
    }
  }

  /**
   * Scan directory and return file map
   */
  private async scanDirectory(dirPath: string): Promise<Map<string, FileInfo>> {
    const fileMap = new Map<string, FileInfo>();

    try {
      await this.scanDirectoryRecursive(dirPath, dirPath, fileMap);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return fileMap;
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectoryRecursive(
    currentPath: string,
    basePath: string,
    fileMap: Map<string, FileInfo>
  ): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      const stats = await fs.stat(fullPath);
      const fileInfo: FileInfo = {
        path: fullPath,
        relativePath,
        stats,
        isDirectory: entry.isDirectory()
      };

      fileMap.set(relativePath, fileInfo);

      if (entry.isDirectory()) {
        await this.scanDirectoryRecursive(fullPath, basePath, fileMap);
      }
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }
}

/**
 * Utility function to start dual-target synchronization
 */
export async function startDualTargetSync(
  sourcePath: string,
  clientTargetPath: string,
  serverTargetPath: string
): Promise<DualTargetSynchronizer> {
  const synchronizer = new DualTargetSynchronizer(
    sourcePath,
    clientTargetPath,
    serverTargetPath
  );
  await synchronizer.start();
  return synchronizer;
}

// Export the main class
export { DualTargetSynchronizer };
