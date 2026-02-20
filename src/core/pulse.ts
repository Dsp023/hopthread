import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { TheHand } from "../tools/hand";
import { TheEye } from "../tools/eye";
import chalk from "chalk";

dotenv.config();

// Provider types
type Provider = "groq" | "google" | "openai" | "nvidia";

// Helper to get active provider from .env
function getActiveProvider(): Provider {
  return (process.env.HOPTHREAD_PROVIDER as Provider) || "groq";
}

// Lazy client initializers
function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set. Run: hopthread config groq_key <key>");
  return new Groq({ apiKey: key });
}

function getGoogleClient() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is not set. Run: hopthread config google_key <key>");
  return new GoogleGenerativeAI(key);
}

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set. Run: hopthread config openai_key <key>");
  return new OpenAI({ apiKey: key });
}

function getNvidiaClient() {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY is not set. Run: hopthread config nvidia_key <key>");
  return new OpenAI({
    apiKey: key,
    baseURL: "https://integrate.api.nvidia.com/v1",
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
        properties: { command: { type: "string" } },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create or overwrite a file.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, content: { type: "string" } },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read file content.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scan_directory",
      description: "Deeply scan a directory.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_map",
      description: "Generate a Mermaid.js diagram of the codebase structure.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_use_cases",
      description: "Analyze the codebase to identify potential business and technical use cases.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
];

export async function getPulse(prompt: string) {
  const provider = getActiveProvider();
  console.log(chalk.dim(`[PULSE] Using provider: ${provider}`));

  try {
    if (provider === "groq") {
      const groq = getGroqClient();
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        tools: tools as any,
      });
      return handleChatResponse(response.choices[0].message, "groq", prompt);
    } 
    
    if (provider === "nvidia") {
      const nvidia = getNvidiaClient();
      const response = await nvidia.chat.completions.create({
        model: "moonshotai/kimi-k2.5",
        messages: [{ role: "user", content: prompt }],
        tools: tools as any,
      });
      return handleChatResponse(response.choices[0].message, "nvidia", prompt);
    }

    if (provider === "google") {
      const genAI = getGoogleClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }

    return "Unsupported provider.";
  } catch (error: any) {
    return `Pulse Error: ${error.message}`;
  }
}

async function handleChatResponse(message: any, provider: Provider, originalPrompt: string) {
  if (message.tool_calls) {
      let finalResult = "";
    for (const toolCall of message.tool_calls) {
      const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      console.log(chalk.yellow(`[PULSE] Executing: ${name}`));
      
      if (name === "execute_shell") finalResult += TheHand.execute(args.command);
      if (name === "write_file") finalResult += TheHand.write(args.path, args.content);
      if (name === "read_file") finalResult += TheHand.read(args.path);
      if (name === "scan_directory") finalResult += JSON.stringify(await TheEye.scan(args.path));
      if (name === "generate_map") finalResult += await TheEye.generateDiagram(args.path);
      
      if (name === "analyze_use_cases") {
          const rawContext = await TheEye.identifyUseCases(args.path);
          const analysisPrompt = `Based on the following code context, identify 5-7 distinct Business and Technical Use Cases for this project. Format as a clean markdown list:\n\n${rawContext}`;
          return await getPulse(analysisPrompt); // Recursive call for AI interpretation
      }
    }
    return finalResult || `Task executed via ${provider}.`;
  }
  return message.content;
}
