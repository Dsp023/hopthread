import Groq from "groq-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getPulse(prompt: string) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are the core intelligence of Anyatheard, an inevitable agentic framework. Keep responses sharp, technical, and aligned with Dsp's vision.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No pulse detected.";
  } catch (error) {
    return `Pulse Error: ${error}`;
  }
}
