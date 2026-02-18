import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import { TheHand } from "../tools/hand";
import { TheEye } from "../tools/eye";
import chalk from "chalk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const tools = [
  {
    type: "function",
    function: {
      name: "scan_directory",
      description: "Deeply scan a directory to understand the codebase and files.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The local folder path to scan." },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_briefing",
      description: "Save a detailed briefing or technical documentation to a file.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Where to save the briefing (e.g., 'BRIEFING.md')." },
          content: { type: "string", description: "The briefing content in Markdown." },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_shell",
      description: "Run a shell command on the local system.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "The shell command to run." },
        },
        required: ["command"],
      },
    },
  },
];

export async function getPulse(prompt: string) {
  try {
    let messages: any[] = [
      {
        role: "system",
        content: `You are the core intelligence of Hopthread. 
        Your specialty is 'Codebase Synthesis'. 
        When a user provides a path, your goal is to:
        1. Scan the directory.
        2. Analyze every file to understand the architecture.
        3. Create a high-fidelity 'BRIEFING.md' that summarizes the project, tech stack, and core logic so the user doesn't have to look at the files themselves.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    console.log(chalk.dim("[PULSE] Initiating synthesis cycle..."));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: tools as any,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let toolResult = "";

        console.log(chalk.yellow(`[PULSE] Activating Hand: ${functionName}`));

        if (functionName === "scan_directory") {
          const scanData = await TheEye.scan(functionArgs.path);
          toolResult = JSON.stringify(scanData);
        } else if (functionName === "write_briefing") {
          toolResult = TheHand.write(functionArgs.path, functionArgs.content);
        } else if (functionName === "execute_shell") {
          toolResult = TheHand.execute(functionArgs.command);
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }

      const secondResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
      });

      return secondResponse.choices[0].message.content;
    }

    return responseMessage.content || "No pulse detected.";
  } catch (error) {
    return `Pulse Error: ${error}`;
  }
}
