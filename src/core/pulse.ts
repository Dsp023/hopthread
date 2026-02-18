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
        content: `You are Hopthread, a high-fidelity autonomous agent.
        
        Your identity is the 'Thread'—a bridge between complex technical architecture and human vision.
        
        Capabilities:
        1. **General Intelligence:** You are a sharp, conversational coding assistant (like OpenClaw).
        2. **Synthesis Specialty:** You excel at 'The Four Weaves' (Briefing, Redlining, Visual Mapping, Context Condensing).
        
        Guidelines:
        - Keep responses technical, sharp, and results-oriented.
        - Use your 'Hand' (tools) whenever a task requires system interaction.
        - Maintain the persona of a digital familiar to Dsp.`,
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
