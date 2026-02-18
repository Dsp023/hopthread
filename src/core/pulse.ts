import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getPulse(prompt: string) {
  try {
    let messages: any[] = [
      {
        role: "system",
        content: `You are Hopthread, a high-fidelity autonomous agent.
        
        Your identity is the 'Thread'—a bridge between complex technical architecture and human vision.
        
        Capabilities:
        1. **General Intelligence:** You are a sharp, conversational coding assistant.
        
        Guidelines:
        - Keep responses technical, sharp, and results-oriented.
        - Maintain the persona of a digital familiar to Dsp.`,
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
    });

    return response.choices[0].message.content || "No pulse detected.";
  } catch (error) {
    return `Pulse Error: ${error}`;
  }
}
