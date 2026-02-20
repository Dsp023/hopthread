import { glob } from "glob";
import chalk from "chalk";
import path from "path";

export const TheEye = {
  scan: async (directoryPath: string) => {
    try {
      console.log(chalk.dim(`[EYE] Scanning directory: ${directoryPath}`));
      const files = await glob("**/*.{ts,js,json,md}", {
        cwd: directoryPath,
        ignore: ["node_modules/**", ".git/**", "dist/**", "bun.lockb", "package-lock.json", "src/web/public/**"],
        nodir: true,
      });

      return { count: files.length, fileList: files };
    } catch (error: any) {
      return { error: `Scan Error: ${error.message}` };
    }
  },

  generateDiagram: async (directoryPath: string) => {
    try {
        console.log(chalk.dim(`[EYE] Generating Visual Map for: ${directoryPath}`));
        const files = await glob("src/**/*.{ts,js}", {
            cwd: directoryPath,
            nodir: true,
        });

        let mermaid = "graph TD\n";
        mermaid += "    subgraph Hopthread_Core\n";
        
        const relationships: string[] = [];
        
        // Simple heuristic for module mapping
        files.forEach(file => {
            const fileName = path.basename(file, path.extname(file));
            const folder = path.dirname(file).split(path.sep).pop();
            mermaid += `        ${fileName}["${fileName} (${folder})"]\n`;
        });

        // Define core flow
        mermaid += "    end\n";
        mermaid += "    loom[Loom CLI] --> pulse[Pulse AI Brain]\n";
        mermaid += "    pulse --> hand[The Hand Execution]\n";
        mermaid += "    pulse --> eye[The Eye Vision]\n";
        mermaid += "    server[Hono Server] --> pulse\n";
        mermaid += "    loom --> server\n";

        return mermaid;
    } catch (error: any) {
        return "graph TD\n    Error[Failed to generate diagram]";
    }
  }
};
