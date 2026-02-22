import { getPulse } from "../core/pulse";
import chalk from "chalk";

/**
 * TADOW - The Vibe Coding Engine for Hopthread
 * 
 * Vibe coding is about intuition, speed, and aesthetics. 
 * This module bypasses rigid planning for high-velocity creation.
 */
export const Tadow = {
  vibe: async (instruction: string) => {
    console.log(chalk.magenta(`\n✨ [TADOW] Catching the vibe: "${instruction}"`));
    
    const vibePrompt = `
      You are the TADOW Vibe Engine. Your goal is to manifest the user's creative vision with extreme style and speed.
      
      VIBE GUIDELINES:
      1. NO RIGID PLANNING: Move straight to the "Hand" (execution).
      2. HIGH AESTHETIC: Prioritize Tailwind, Lucide, GSAP, and sleek Dark-Mode UI.
      3. CONCISE: Skip the technical explanations unless they are "cool".
      4. FLOW: Use the latest Bun/Hono patterns.
      
      TASK: ${instruction}
      
      Respond as a master of digital manifestion. Start with "✨ TADOW."
    `;

    return await getPulse(vibePrompt);
  }
};
