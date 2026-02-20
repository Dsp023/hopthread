import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getPulse } from '../core/pulse';
import chalk from 'chalk';
import path from 'path';

export function startServer() {
    const app = new Hono();

    // Serve static files from the public directory
    app.use('/static/*', serveStatic({ 
        root: './',
        rewriteRequestPath: (urlPath) => urlPath.replace(/^\/static/, 'src/web/public')
    }));

    app.get('/', (c) => {
        return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HOPTHREAD | NEURAL CONSOLE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Plus+Jakarta+Sans:wght@200;400;700;800&display=swap');
        :root {
            --bg: #020203;
            --accent: #3b82f6;
            --surface: #0a0a0c;
            --border: #1a1a1a;
        }
        body { background: var(--bg); color: #e0e0e0; font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; height: 100vh; display: flex; }
        .sidebar { width: 300px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .chat-viewport { flex-grow: 1; overflow-y: auto; scroll-behavior: smooth; }
        .message { border-bottom: 1px solid var(--border); padding: 2rem; opacity: 0; transform: translateY(10px); }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .input-bar { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 0 30px rgba(0,0,0,0.5); }
        .input-bar:focus-within { border-color: var(--accent); }
        textarea { background: transparent; border: none; outline: none; color: white; resize: none; width: 100%; font-size: 0.9rem; }
    </style>
</head>
<body class="flex">
    <aside class="sidebar p-6">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <i data-lucide="layout-grid" class="text-white w-6 h-6"></i>
            </div>
            <span class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</span>
        </div>
        <nav class="flex-grow space-y-2">
            <div class="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4">Core System</div>
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium">
                <i data-lucide="terminal" class="w-4 h-4 text-blue-400"></i> Console Active
            </div>
        </nav>
        <div class="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 mt-auto">
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">Uplink Stable</span>
            </div>
        </div>
    </aside>

    <main class="flex-grow flex flex-col">
        <header class="p-6 border-b border-border bg-surface/50 backdrop-blur-md flex justify-between items-center">
            <div class="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-blue-500"></i> Station: DSP-STATION
            </div>
        </header>

        <div id="chatViewport" class="chat-viewport p-8">
            <div id="chatThread" class="max-w-[900px] mx-auto w-full">
                <div class="message flex gap-6 ai-init">
                    <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <i data-lucide="zap" class="text-white w-6 h-6 fill-white"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-2">System Pulse</div>
                        <div class="text-sm leading-relaxed text-neutral-300">Neural link established. Ready to weave. Define a task to begin.</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-8 flex justify-center bg-gradient-to-t from-bg to-transparent">
            <div class="input-bar w-full max-w-[900px] flex items-end p-3 pr-4">
                <textarea id="taskInput" rows="1" class="p-3 mono h-14" placeholder="Type a system command..."></textarea>
                <button onclick="handleWeave()" class="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                    <i data-lucide="arrow-up" class="w-6 h-6"></i>
                </button>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            gsap.to(".message", { opacity: 1, y: 0, duration: 0.8 });
        });

        const input = document.getElementById('taskInput');
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWeave(); }
        });

        async function handleWeave() {
            const task = input.value.trim();
            if (!task) return;

            addMessage(task, 'user');
            input.value = '';
            input.style.height = 'auto';

            const loadingId = addMessage('Processing thread sequence...', 'ai', true);

            try {
                const res = await fetch('/api/weave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task })
                });
                const data = await res.json();
                updateMessage(loadingId, data.response);
            } catch (err) {
                updateMessage(loadingId, "Connection Interrupted: " + err.message);
            }
        }

        function addMessage(text, role, isLoading = false) {
            const id = 'msg-' + Date.now();
            const div = document.createElement('div');
            div.id = id;
            div.className = 'message flex gap-6';
            const icon = role === 'user' ? 'user' : 'zap';
            const tag = role === 'user' ? 'Input Buffer' : 'Pulse Response';
            const bg = role === 'ai' ? 'bg-blue-600' : 'bg-neutral-800';
            
            div.innerHTML = \`
                <div class="w-12 h-12 rounded-2xl \${bg} flex items-center justify-center flex-shrink-0 shadow-lg">
                    <i data-lucide="\${icon}" class="text-white w-6 h-6"></i>
                </div>
                <div class="flex-grow">
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-2">\${tag}</div>
                    <div class="text-sm leading-relaxed \${isLoading ? 'animate-pulse opacity-50' : ''}">\${text}</div>
                </div>
            \`;
            document.getElementById('chatThread').appendChild(div);
            lucide.createIcons();
            gsap.to(div, { opacity: 1, y: 0, duration: 0.4 });
            document.getElementById('chatViewport').scrollTo(0, document.getElementById('chatViewport').scrollHeight);
            return id;
        }

        function updateMessage(id, text) {
            const msg = document.getElementById(id);
            const content = msg.querySelector('.text-sm');
            content.innerText = text;
            content.classList.remove('animate-pulse', 'opacity-50');
        }
    </script>
</body>
</html>
        `);
    });

    app.post('/api/weave', async (c) => {
        const { task } = await c.req.json();
        console.log(chalk.cyan(`[WEB] Incoming: ${task}`));
        try {
            const response = await getPulse(task);
            return c.json({ response });
        } catch (err: any) {
            return c.json({ response: "Error: " + err.message }, 500);
        }
    });

    const port = 3000;
    console.log(chalk.blue(`\n🌒 Hopthread UI starting on http://localhost:${port}`));
    serve({ fetch: app.fetch, port });
}
