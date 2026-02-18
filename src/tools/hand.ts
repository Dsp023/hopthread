import { execSync } from "child_process";
import { writeFileSync, readFileSync } from "fs";
import chalk from "chalk";

export const TheHand = {
  /**
   * Executes a shell command and returns the output
   */
  execute: (command: string): string => {
    try {
      console.log(chalk.dim(`[HAND] Executing: ${command}`));
      const result = execSync(command, { encoding: "utf8" });
      return result;
    } catch (error: any) {
      return `Execution Error: ${error.message}`;
    }
  },

  /**
   * Writes a file to the workspace
   */
  write: (path: string, content: string): string => {
    try {
      console.log(chalk.dim(`[HAND] Writing: ${path}`));
      writeFileSync(path, content, "utf8");
      return `Successfully wrote to ${path}`;
    } catch (error: any) {
      return `Write Error: ${error.message}`;
    }
  },

  /**
   * Reads a file from the workspace
   */
  read: (path: string): string => {
    try {
      console.log(chalk.dim(`[HAND] Reading: ${path}`));
      return readFileSync(path, "utf8");
    } catch (error: any) {
      return `Read Error: ${error.message}`;
    }
  }
};
