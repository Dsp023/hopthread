import { glob } from "glob";
import { TheHand } from "./hand";
import chalk from "chalk";
import path from "path";

export const TheEye = {
  scan: async (directoryPath: string) => {
    try {
      console.log(chalk.dim(`[EYE] Scanning directory: ${directoryPath}`));
      const files = await glob("**/*", {
        cwd: directoryPath,
        ignore: ["node_modules/**", ".git/**", "dist/**", "bun.lockb", "package-lock.json"],
        nodir: true,
      });

      let snapshot = "";
      for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const content = TheHand.read(fullPath);
        snapshot += `\n--- FILE: ${file} ---\n${content.slice(0, 2000)}\n`;
      }

      return { count: files.length, snapshot, fileList: files };
    } catch (error: any) {
      return { error: `Scan Error: ${error.message}` };
    }
  }
};
