import { glob } from "glob";
import chalk from "chalk";
import path from "path";
import fs from "fs";

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
        
        // Define Clusters/Subgraphs based on folder structure
        const folders = new Set(files.map(f => path.dirname(f)));
        
        folders.forEach(folder => {
            const folderName = folder.replace(/\\/g, '/').replace('src/', '');
            mermaid += `    subgraph ${folderName.replace(/\//g, '_')}_Cluster [${folderName}]\n`;
            files.filter(f => path.dirname(f) === folder).forEach(file => {
                const fileName = path.basename(file, path.extname(file));
                mermaid += `        ${fileName}["${fileName}${path.extname(file)}"]\n`;
            });
            mermaid += "    end\n";
        });

        // Add standard relationships for Hopthread architecture
        mermaid += "\n    %% Core Logic Flow\n";
        mermaid += "    loom --> pulse\n";
        mermaid += "    server --> pulse\n";
        mermaid += "    pulse --> hand\n";
        mermaid += "    pulse --> eye\n";
        
        // Dynamic dependency detection (simple import grep)
        files.forEach(file => {
            const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            const fileName = path.basename(file, path.extname(file));
            
            // Look for imports from our own modules
            const importMatches = content.match(/from\s+['"]\.\.?\/([^'"]+)['"]/g);
            if (importMatches) {
                importMatches.forEach(match => {
                    const target = path.basename(match.split('/').pop()?.replace(/['"]/g, '') || "");
                    if (target && target !== fileName) {
                        mermaid += `    ${fileName} -.-> ${target}\n`;
                    }
                });
            }
        });

        return mermaid;
    } catch (error: any) {
        console.error(error);
        return "graph TD\n    Error[Failed to generate diagram]";
    }
  },

  identifyUseCases: async (directoryPath: string) => {
    try {
        console.log(chalk.dim(`[EYE] Analyzing Use Cases for: ${directoryPath}`));
        const files = await glob("**/*.{ts,js,md,json}", {
            cwd: directoryPath,
            ignore: ["node_modules/**", ".git/**"],
            nodir: true,
        });

        let combinedContext = "";
        for (const file of files.slice(0, 15)) { 
            const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            combinedContext += `\nFILE: ${file}\n${content.slice(0, 500)}\n`;
        }

        return combinedContext;
    } catch (error: any) {
        return `Use Case Analysis Error: ${error.message}`;
    }
  }
};
