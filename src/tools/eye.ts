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
      nodes.push({ 
        id: fileName, 
        group: folder, 
        label: fileName + path.extname(file),
        path: file 
      });
    });

    // Dynamic dependency detection
    files.forEach(file => {
      const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
      const fileName = path.basename(file, path.extname(file));
      
      // Complexity Score (Basic)
      const score = content.length / 100 + (content.match(/import/g)?.length || 0) * 5;
      
      const importMatches = content.match(/from\s+['"]\.\.?\/([^'"]+)['"]/g) || 
                           content.match(/import\s+.*?\s+from\s+['"]\.\.?\/([^'"]+)['"]/g) ||
                           content.match(/require\(['"]\.\.?\/([^'"]+)['"]\)/g);
      
      if (importMatches) {
        importMatches.forEach(match => {
          const cleanMatch = match.replace(/['"\(\)]/g, '').split(' ').pop() || "";
          const target = path.basename(cleanMatch);
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
  },

  identifyGrafts: async (directoryPath: string) => {
    try {
      console.log(chalk.dim(`[EYE] Identifying Intelligence Grafts for: ${directoryPath}`));
      const files = await glob("src/**/*.{ts,js}", {
        cwd: directoryPath,
        nodir: true,
      });

      const grafts: any[] = [];

      for (const file of files) {
        const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
        const lines = content.split('\n');
        
        // Basic heuristic: Long functions, complex logic, or TODOs
        lines.forEach((line, index) => {
          if (line.includes('TODO:') || line.includes('FIXME:')) {
            grafts.push({
              file,
              line: index + 1,
              type: 'debt',
              reason: 'Unresolved technical debt',
              context: line.trim()
            });
          }
          
          if (line.match(/async\s+function|const\s+\w+\s*=\s*async/)) {
            // Check for missing error handling or complex async flows
            const scope = lines.slice(index, index + 5).join('\n');
            if (!scope.includes('try') && !scope.includes('catch')) {
              grafts.push({
                file,
                line: index + 1,
                type: 'safety',
                reason: 'Async operation missing try/catch block',
                context: line.trim()
              });
            }
          }

          if (line.match(/process\.env\./) && !line.match(/\|\|/)) {
            grafts.push({
              file,
              line: index + 1,
              type: 'config',
              reason: 'Unprotected environment variable access',
              context: line.trim()
            });
          }

          // Heuristic: Large functions (over 50 lines of code)
          if (line.match(/function|=>\s*{/)) {
            let braceCount = 0;
            let startLine = index;
            let endLine = index;
            for (let i = index; i < lines.length; i++) {
                if (lines[i].includes('{')) braceCount++;
                if (lines[i].includes('}')) braceCount--;
                if (braceCount === 0 && i > index) {
                    endLine = i;
                    break;
                }
            }
            if (endLine - startLine > 50) {
                grafts.push({
                    file,
                    line: startLine + 1,
                    type: 'refactor',
                    reason: 'High function complexity (Long Method)',
                    context: line.trim()
                });
            }
          }

          if (line.length > 120) {
            grafts.push({
              file,
              line: index + 1,
              type: 'complexity',
              reason: 'High line complexity / density',
              context: line.trim()
            });
          }
        });
      }

      return grafts;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  }
};
