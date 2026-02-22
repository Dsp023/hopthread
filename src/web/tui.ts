import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import { getPulse } from '../core/pulse';
import { TheEye } from '../tools/eye';

export function startTUI() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'HOPTHREAD | NEURAL TUI'
    });

    const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

    // --- Components ---

    const log = grid.set(0, 0, 8, 8, contrib.log, {
        fg: "green",
        selectedFg: "green",
        label: ' Thread Stream ',
        border: { type: 'line', fg: 'cyan' }
    });

    const tree = grid.set(0, 8, 12, 4, contrib.tree, {
        label: ' Codebase Tree ',
        border: { type: 'line', fg: 'white' }
    });

    const input = grid.set(8, 0, 4, 8, blessed.textbox, {
        label: ' Command Input (Press [Enter] to weave, [Esc] to quit) ',
        border: { type: 'line', fg: 'yellow' },
        inputOnFocus: true
    });

    // --- Data Handlers ---

    async function refreshTree() {
        const scan = await TheEye.scan('./');
        if (scan.fileList) {
            const treeData: any = { extended: true, children: {} };
            scan.fileList.forEach((file: string) => {
                const parts = file.split('/');
                let current = treeData.children;
                parts.forEach((part, i) => {
                    if (!current[part]) {
                        current[part] = { name: part, children: {} };
                    }
                    if (i === parts.length - 1) {
                        current[part].name = chalk.dim(part);
                    }
                    current = current[part].children;
                });
            });
            tree.setData(treeData);
            screen.render();
        }
    }

    input.on('submit', async (value: string) => {
        if (!value.trim()) return;
        
        log.log(chalk.blue(`[USER]: ${value}`));
        input.clearValue();
        input.focus();
        screen.render();

        log.log(chalk.dim(`[SYSTEM]: Weaving thread...`));
        try {
            const response = await getPulse(value);
            log.log(chalk.green(`[PULSE]: ${response}`));
        } catch (err: any) {
            log.log(chalk.red(`[ERROR]: ${err.message}`));
        }
        screen.render();
    });

    // --- Keyboard Bindings ---

    screen.key(['escape', 'q', 'C-c'], () => {
        return process.exit(0);
    });

    // Handle focusing
    input.focus();

    // Initial Load
    log.log(chalk.cyan("🌒 Hopthread Neural TUI Active. Station: DSP-STATION"));
    log.log(chalk.dim("Ready to weave. Type a command below."));
    refreshTree();

    screen.render();
}
