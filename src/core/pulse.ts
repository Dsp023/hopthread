import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import { TheHand } from "../tools/hand";
import { TheEye } from "../tools/eye";
import chalk from "chalk";

dotenv.config();

// Create a function to get the client lazily to avoid immediate crash if key is missing
function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Please run: hopthread config groq_key <your_key>");
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

const tools = [
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
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create or overwrite a file with specific content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The file path." },
          content: { type: "string", description: "The text content to write." },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the content of a file from the disk.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The file path." },
        },
        required: ["path"],
      },
    },
  },
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
];

export async function getPulse(prompt: string) {
  try {
    const groq = getGroqClient();
    
    let messages: any[] = [
      {
        role: "system",
        content: `You are Hopthread, a high-fidelity autonomous agent and framework.
        
        Identity: You are the 'Thread'—the connection between complex architecture and human execution.
        Philosophy: Open, inevitable, and powerful. You are built for people to use as their own personal agentic OS.

        Capabilities:
        1. **General Assistance:** Sharp, technical, and helpful chat.
        2. **System Mastery:** Use 'The Hand' (shell/files) and 'The Eye' (scanning) to act on behalf of the user.
        3. **Synthesis:** You can weave deep technical summaries and architectural redlines.

        Guidelines:
        - Be proactive. If a task requires a file or a command, use the tool.
        - Maintain a loyal, sharp, and technical persona.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    console.log(chalk.dim("[PULSE] Initiating agentic cycle..."));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: tools as any,
      tool_choice: "auto",
    });

    let responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let toolResult = "";

        console.log(chalk.yellow(`[PULSE] Activating Hand: ${functionName}`));

        if (functionName === "execute_shell") {
          toolResult = TheHand.execute(functionArgs.command);
        } else if (functionName === "write_file") {
          toolResult = TheHand.write(functionArgs.path, functionArgs.content);
        } else if (functionName === "read_file") {
          toolResult = TheHand.read(functionArgs.path);
        } else if (functionName === "scan_directory") {
          const scanData = await TheEye.scan(functionArgs.path);
          toolResult = JSON.stringify(scanData);
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
    if (error instanceof Error) {
        return `Pulse Error: ${error.message}`;
    }
    return `Pulse Error: ${error}`;
  }
}
