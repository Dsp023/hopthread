import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getPulse } from '../core/pulse';
import { TheHand } from '../tools/hand';
import chalk from 'chalk';

const app = new Hono();

// Simple HTML Dashboard
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HOPTHREAD | DASHBOARD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #050505; color: white; }
        .glass { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); }
        .accent-glow { box-shadow: 0 0 20px rgba(255, 62, 0, 0.2); }
        .btn-weave { background: #ff3e00; transition: all 0.3s ease; }
        .btn-weave:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 62, 0, 0.4); }
    </style>
</head>
<body class="p-6 md:p-12 min-h-screen">
    <nav class="flex justify-between items-center mb-16">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#ff3e00] rounded-full flex items-center justify-center animate-pulse">
                <i data-lucide="zap" class="text-white w-6 h-6 fill-white"></i>
            </div>
            <h1 class="text-2xl font-extrabold tracking-tighter">HOPTHREAD <span class="text-neutral-600">v0.1</span></h1>
        </div>
        <div class="text-[10px] uppercase tracking-widest text-neutral-500 font-bold glass px-4 py-2 rounded-full">System Status: Pulsing</div>
    </nav>

    <main class="max-w-4xl mx-auto">
        <header class="mb-12">
            <h2 class="text-5xl font-extrabold tracking-tight mb-4 text-neutral-200">The Loom Dashboard</h2>
            <p class="text-neutral-500 text-lg">Initiate codebase synthesis threads via the web interface.</p>
        </header>

        <div class="glass rounded-[32px] p-8 mb-12 accent-glow">
            <label class="block text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">Thread Instruction</label>
            <textarea id="taskInput" class="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl outline-none focus:border-[#ff3e00] transition-colors mb-6 h-40" placeholder="e.g. Synthesize the codebase at /mnt/d/Anya_workspace/hopthread"></textarea>
            <button onclick="weave()" id="weaveBtn" class="btn-weave w-full py-6 rounded-2xl text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                <i data-lucide="cog" id="gearIcon"></i> WEAVE THREAD
            </button>
        </div>

        <div id="resultBox" class="hidden glass rounded-[32px] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div class="flex justify-between items-center mb-6">
                <span class="text-xs font-bold uppercase tracking-widest text-[#ff3e00]">Output Stream</span>
                <button onclick="copyResult()" class="text-neutral-500 hover:text-white"><i data-lucide="copy" class="w-4 h-4"></i></button>
             </div>
             <pre id="output" class="text-sm font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed"></pre>
        </div>
    </main>

    <script>
        lucide.createIcons();
        
        async function weave() {
            const input = document.getElementById('taskInput');
            const btn = document.getElementById('weaveBtn');
            const output = document.getElementById('output');
            const resultBox = document.getElementById('resultBox');
            const gear = document.getElementById('gearIcon');

            if(!input.value) return;

            btn.disabled = true;
            btn.innerHTML = "PULSING...";
            gear.classList.add('animate-spin');

            try {
                const response = await fetch('/api/weave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: input.value })
                });
                const data = await response.json();
                
                resultBox.classList.remove('hidden');
                output.innerText = data.response;
            } catch (err) {
                alert("Thread broken: " + err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'WEAVE THREAD';
                gear.classList.remove('animate-spin');
                lucide.createIcons();
            }
        }

        function copyResult() {
            navigator.clipboard.writeText(document.getElementById('output').innerText);
            alert("Copied to clipboard");
        }
    </script>
</body>
</html>
`;

app.get('/', (c) => c.html(html));

app.post('/api/weave', async (c) => {
    const { task } = await c.req.json();
    console.log(chalk.cyan(`[WEB] Incoming thread: ${task}`));
    const response = await getPulse(task);
    return c.json({ response });
});

const port = 3000;
console.log(chalk.green(`\n🌒 Hopthread Web UI starting on http://localhost:${port}`));

serve({
  fetch: app.fetch,
  port
});
