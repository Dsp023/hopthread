import { glob } from "glob";
import { TheHand } from "../tools/hand";
import chalk from "chalk";
import path from "path";

export const TheEye = {
  /**
   * Scans a directory and returns a structural map of the codebase
   */
  scan: async (directoryPath: string) => {
    try {
      console.log(chalk.dim(`[EYE] Scanning directory: ${directoryPath}`));
      
      // Get all relevant files (ignoring common noise)
      const files = await glob("**/*", {
        cwd: directoryPath,
        ignore: ["node_modules/**", ".git/**", "dist/**", "bun.lockb", "package-lock.json"],
        nodir: true,
      });

      console.log(chalk.green(`[EYE] Found ${files.length} relevant files.`));

      // Build a snapshot of the codebase (first 2000 chars of each file for context)
      let codebaseSnapshot = "";
      
      for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const content = TheHand.read(fullPath);
        codebaseSnapshot += `\n--- FILE: ${file} ---\n${content.slice(0, 2000)}\n`;
      }

      return {
        count: files.length,
        snapshot: codebaseSnapshot,
        fileList: files
      };
    } catch (error: any) {
      return { error: `Scan Error: ${error.message}` };
    }
  }
};
