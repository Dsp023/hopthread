import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";
import chalk from "chalk";

export const TheHand = {
  execute: (command: string, dryRun: boolean = false): string => {
    try {
      if (dryRun) {
        console.log(chalk.yellow(`[GHOST] Simulating: ${command}`));
        return `[GHOST MODE] Command "${command}" would be executed.`;
      }
      
      console.log(chalk.dim(`[HAND] Executing: ${command}`));
      const result = execSync(command, { encoding: "utf8" });
      return result;
    } catch (error: any) {
      return `Execution Error: ${error.message}`;
    }
  },

  write: (path: string, content: string, dryRun: boolean = false): string => {
    try {
      if (dryRun) {
        console.log(chalk.yellow(`[GHOST] Simulating write to: ${path}`));
        let diff = "[GHOST MODE] Proposed Change:\n";
        if (existsSync(path)) {
            diff += `--- Existing file: ${path} ---\n(Diffing logic pending integration)`;
        } else {
            diff += `--- New file: ${path} ---\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`;
        }
        return diff;
      }

      console.log(chalk.dim(`[HAND] Writing: ${path}`));
      writeFileSync(path, content, "utf8");
      return `Successfully wrote to ${path}`;
    } catch (error: any) {
      return `Write Error: ${error.message}`;
    }
  },

  read: (path: string): string => {
    try {
      console.log(chalk.dim(`[HAND] Reading: ${path}`));
      return readFileSync(path, "utf8");
    } catch (error: any) {
      return `Read Error: ${error.message}`;
    }
  }
};
