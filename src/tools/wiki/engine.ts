import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { TheEye } from '../eye';
import { getPulse } from '../../core/pulse';

export const WikiEngine = {
    generate: async (directoryPath: string = './') => {
        console.log(chalk.cyan(`\n🧶 Initializing Neural Documentation for: ${directoryPath}`));
        
        try {
            // 1. Scan codebase for structural map
            const structure = await TheEye.scan(directoryPath);
            if (structure.error) throw new Error(structure.error);

            // 2. Identify Intelligence Grafts & Complexity
            const grafts = await TheEye.identifyGrafts(directoryPath);

            // 3. Condense Context for LLM Synthesis
            const context = await TheEye.condenseContext(directoryPath);

            // 4. Synthesize Wiki Content using The Pulse
            console.log(chalk.dim(`[WIKI] Synthesizing architectural overview...`));
            const prompt = `
                Generate a high-fidelity 'NEURAL_WIKI.md' for this project.
                
                Codebase Snapshot:
                ${context.slice(0, 10000)} // Truncated for safety

                Graft Analysis (Technical Debt/Complexity):
                ${JSON.stringify(grafts, null, 2)}

                Requirements:
                1. Use a kinetic, deep-space aesthetic in the writing style.
                2. Include an 'Architectural DNA' section mapping the core modules.
                3. Create a 'Knowledge Graph' text-representation of dependencies.
                4. List 'Intelligence Hotspots' based on the graft analysis (where AI refactoring is needed).
                5. Provide 'Operational Directives' (CLI commands and usage).
                6. Add a 'Vibe Audit' describing the current development flow.

                Format: Clean, high-fidelity Markdown.
            `;

            const wikiMarkdown = await getPulse(prompt);

            // 5. Write to File
            const wikiPath = path.join(directoryPath, 'NEURAL_WIKI.md');
            fs.writeFileSync(wikiPath, wikiMarkdown);

            console.log(chalk.green(`\n✅ Neural Wiki Manifested: ${wikiPath}\n`));
            return wikiPath;

        } catch (error: any) {
            console.error(chalk.red(`\n❌ Wiki Generation Failed: ${error.message}`));
            return null;
        }
    }
};
