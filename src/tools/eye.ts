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

        const nodes: any[] = [];
        const links: any[] = [];
        
        files.forEach(file => {
            const fileName = path.basename(file, path.extname(file));
            const folder = path.dirname(file).split(path.sep).pop();
            nodes.push({ id: fileName, group: folder, label: fileName + path.extname(file) });
        });

        // Dynamic dependency detection
        files.forEach(file => {
            const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            const fileName = path.basename(file, path.extname(file));
            const importMatches = content.match(/from\s+['"]\.\.?\/([^'"]+)['"]/g);
            if (importMatches) {
                importMatches.forEach(match => {
                    const target = path.basename(match.split('/').pop()?.replace(/['"]/g, '') || "");
                    if (target && target !== fileName) {
                        links.push({ source: fileName, target: target });
                    }
                });
            }
        });

        return { nodes, links };
    } catch (error: any) {
        console.error(error);
        return { nodes: [], links: [], error: error.message };
    }
  },

  condenseContext: async (directoryPath: string) => {
    try {
        console.log(chalk.dim(`[EYE] Condensing Context for: ${directoryPath}`));
        const files = await glob("src/**/*.{ts,js,json,md}", {
            cwd: directoryPath,
            ignore: ["node_modules/**", ".git/**"],
            nodir: true,
        });

        let condenser = "### HOPTHREAD CONTEXT CONDENSER ###\n";
        condenser += `Project Root: ${directoryPath}\n`;
        condenser += `Snapshot Date: ${new Date().toISOString()}\n\n`;

        for (const file of files) {
            const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            // Remove excessive whitespace and comments for token optimization
            const condensedContent = content
                .replace(/\/\/.*$/gm, '') // Remove single line comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
                .trim();

            condenser += `--- FILE: ${file} ---\n`;
            condenser += `\`\`\`typescript\n${condensedContent}\n\`\`\`\n\n`;
        }

        return condenser;
    } catch (error: any) {
        return `Condensation Error: ${error.message}`;
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
