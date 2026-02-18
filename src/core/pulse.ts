import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import { TheHand } from "../tools/hand";
import chalk from "chalk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define tools for the AI model
const tools = [
  {
    type: "function",
    function: {
      name: "execute_shell",
      description: "Run a shell command on the local system and get the output.",
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
];

export async function getPulse(prompt: string) {
  try {
    let messages: any[] = [
      {
        role: "system",
        content: "You are the core intelligence of Anyatheard. You have 'hands' (tools) to interact with the system. Use them when needed to fulfill Dsp's requests.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    console.log(chalk.dim("[PULSE] Initiating thought cycle..."));

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

        console.log(chalk.yellow(`[PULSE] Using tool: ${functionName}`));

        if (functionName === "execute_shell") {
          toolResult = TheHand.execute(functionArgs.command);
        } else if (functionName === "write_file") {
          toolResult = TheHand.write(functionArgs.path, functionArgs.content);
        } else if (functionName === "read_file") {
          toolResult = TheHand.read(functionArgs.path);
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
