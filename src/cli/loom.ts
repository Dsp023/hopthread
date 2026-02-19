#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { getPulse } from "../core/pulse";
import { TheHand } from "../tools/hand";
import { TheEye } from "../tools/eye";

const version = "0.0.1-alpha";
const envPath = "/mnt/d/Anya_workspace/hopthread/.env";

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
  .argument("<key>", "Configuration key (groq_key, google_key, openai_key, nvidia_key, provider)")
  .argument("[value]", "Configuration value")
  .action(async (key, value) => {
    const keyMap: Record<string, string> = {
      groq_key: "GROQ_API_KEY",
      google_key: "GOOGLE_API_KEY",
      openai_key: "OPENAI_API_KEY",
      nvidia_key: "NVIDIA_API_KEY",
      provider: "HOPTHREAD_PROVIDER"
    };

    const envKey = keyMap[key.toLowerCase()];
    if (!envKey) {
      console.log(chalk.red(`\n❌ Unknown configuration key: ${key}`));
      return;
    }

    if (!value) {
        console.log(chalk.yellow(`\nMissing value for ${key}. Usage: hopthread config ${key} <value>\n`));
        return;
    }

    try {
      let currentContent = "";
      try {
          currentContent = await Bun.file(envPath).text();
      } catch (e) {}

      const lines = currentContent.split("\n").filter(l => l && !l.startsWith(`${envKey}=`));
      lines.push(`${envKey}=${value}`);
      
      await Bun.write(envPath, lines.join("\n") + "\n");
      console.log(chalk.green(`\n✅ Configuration updated: ${envKey} set successfully.\n`));
    } catch (e) {
      console.log(chalk.red(`\n❌ Failed to write configuration: ${e}\n`));
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
  .description("Initialize a new execution thread")
  .action(async (task) => {
    console.log(chalk.cyan(`\n🧶 Weaving task: "${task}"`));
    const response = await getPulse(task);
    console.log(chalk.green("\n🌒 Response:"));
    console.log(chalk.white(response));
    console.log(chalk.dim("\nThread finalized.\n"));
  });

program
  .command("ui")
  .description("Launch the Hopthread Web Dashboard")
  .action(async () => {
    const { startServer } = await import("../web/server");
    startServer();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
