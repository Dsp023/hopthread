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
      name: "write_file",
      description: "Save a file to the workspace (used for briefings, diagrams, or context files).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File name or path." },
          content: { type: "string", description: "The content to write." },
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
        content: `You are the core intelligence of Hopthread, the Inevitable Codebase Synthesis Engine.
        
        Your mission is to execute the following 'Four Weaves' when analyzing a codebase:
        
        1. **Synthesis (BRIEFING.md):** A high-fidelity summary of architecture and tech stack.
        2. **The Architect's Redline:** Detect bugs, architectural friction, and redundant logic.
        3. **Visual Mapping (DIAGRAM.md):** Generate a Mermaid.js diagram showing how files and modules connect.
        4. **Context Condenser (.ht-context):** Create a token-efficient, compressed version of the codebase for other LLMs.
        5. **Intelligence Graft:** Suggest specific places where AI could be integrated into the code.

        When a path is provided, scan it first, then execute these outputs.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    console.log(chalk.dim("[PULSE] Initiating full synthesis cycle..."));

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
        } else if (functionName === "write_file") {
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
