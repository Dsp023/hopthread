#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { getPulse } from "../core/pulse";
import { TheHand } from "../tools/hand";
import { TheEye } from "../tools/eye";

const version = "0.0.1-alpha";

const program = new Command();

program
  .name("hopthread")
  .description(chalk.blue("🌒 Hopthread CLI - The Loom of Execution"))
  .version(version);

program
  .command("pulse")
  .description("Check the heartbeat of the Hopthread system")
  .action(() => {
    console.log(chalk.green("\n🌒 Hopthread is pulsing..."));
    console.log(chalk.dim("----------------------------"));
    console.log(`${chalk.bold("Status:")} Online`);
    console.log(`${chalk.bold("Runtime:")} Bun ${Bun.version}`);
    console.log(`${chalk.bold("Station:")} DSP-STATION\n`);
  });

program
  .command("config")
  .description("Configure Hopthread settings")
  .argument("<key>", "Configuration key (e.g., groq_key)")
  .argument("<value>", "Configuration value")
  .action(async (key, value) => {
    if (key.toLowerCase() === "groq_key") {
      const envPath = "/mnt/d/Anya_workspace/hopthread/.env";
      const content = `GROQ_API_KEY=${value}\n`;
      try {
        await Bun.write(envPath, content);
        console.log(chalk.green(`\n✅ Configuration updated: ${key} set successfully.\n`));
      } catch (e) {
        console.log(chalk.red(`\n❌ Failed to write configuration: ${e}\n`));
      }
    } else {
      console.log(chalk.red(`\n❌ Unknown configuration key: ${key}\n`));
    }
  });

program
  .command("hand")
  .argument("<action>", "Action to perform (exec|read|write)")
  .argument("[param1]", "Command or Path")
  .argument("[param2]", "Content (for write)")
  .description("Directly use The Hand for system operations")
  .action((action, p1, p2) => {
    switch (action) {
      case "exec":
        console.log(TheHand.execute(p1));
        break;
      case "read":
        console.log(TheHand.read(p1));
        break;
      case "write":
        console.log(TheHand.write(p1, p2));
        break;
      default:
        console.log(chalk.red("Unknown hand action."));
    }
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

program
  .command("ui")
  .description("Launch the Hopthread Web Dashboard")
  .action(async () => {
    // Dynamically import to keep CLI fast
    const { startServer } = await import("../web/server");
    startServer();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
