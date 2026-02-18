// Anyatheard - Core Entry Point
// Built by Dsp & Anya

console.log("🌒 Anyatheard System Online");
console.log("----------------------------");

const VERSION = "0.0.1-alpha";
const HOST = "DSP-STATION";

async function boot() {
  console.log(`[BOOT] Initializing core modules...`);
  console.log(`[INIT] Runtime: Bun ${Bun.version}`);
  console.log(`[INIT] Version: ${VERSION}`);
  console.log(`[INIT] Station: ${HOST}`);
  
  console.log("\n[SYSTEM] Ready for thread connection.");
}

boot();
