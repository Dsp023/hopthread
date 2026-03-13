import chalk from 'chalk';

export const PulseCommands = {
    help: () => {
        console.log(`
${chalk.cyan("🧶 Hopthread Pulse Commands")}
${chalk.dim("--------------------------")}
/vibe [description]  - Alias for TADOW
/scan                - Trigger The Eye scan
/wiki                - Regenerate Neural Wiki
/ghost [task]        - Run simulation
/clear               - Clear terminal
/exit                - Close session
        `);
    }
};
