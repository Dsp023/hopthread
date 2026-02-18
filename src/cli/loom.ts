#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { getPulse } from "../core/pulse";

const version = "0.0.1-alpha";

const program = new Command();

program
  .name("anyatheard")
  .description(chalk.blue("🌒 Anyatheard CLI - The Loom of Execution"))
  .version(version);

program
  .command("pulse")
  .description("Check the heartbeat of the Anyatheard system")
  .action(() => {
    console.log(chalk.green("\n🌒 Anyatheard is pulsing..."));
    console.log(chalk.dim("----------------------------"));
    console.log(`${chalk.bold("Status:")} Online`);
    console.log(`${chalk.bold("Runtime:")} Bun ${Bun.version}`);
    console.log(`${chalk.bold("Station:")} DSP-STATION\n`);
  });

program
  .command("weave")
  .argument("<task>", "The task to weave into the thread")
  .option("-s, --specialist <type>", "The specialist agent to use", "generalist")
  .description("Initialize a new execution thread")
  .action(async (task, options) => {
    console.log(chalk.cyan(`\n🧶 Weaving task: "${task}"`));
    console.log(chalk.dim(`Using ${options.specialist} specialist via Groq...`));
    
    const response = await getPulse(task);
    
    console.log(chalk.green("\n🌒 Pulse Response:"));
    console.log(chalk.white(response));
    console.log(chalk.dim("\nThread finalized. [PULSE SUCCESSFUL]\n"));
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
