import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getPulse } from '../core/pulse';
import chalk from 'chalk';
import path from 'path';

export function startServer() {
    const app = new Hono();

    // FIXED: Correct path resolution for static files in Bun/Node environment
    // Use the absolute path to ensure the server finds the public directory regardless of where it's launched from
    const publicPath = path.resolve(__dirname, 'public');
    console.log(chalk.dim(`[WEB] Serving static files from: ${publicPath}`));

    app.use('/static/*', serveStatic({ 
        root: './',
        rewriteRequestPath: (urlPath) => {
            // Map /static/css/style.css -> src/web/public/css/style.css
            const newPath = urlPath.replace(/^\/static/, 'src/web/public');
            return newPath;
        }
    }));

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HOPTHREAD | CONSOLE</title>
        <!-- Use absolute-ish paths for styles -->
        <link rel="stylesheet" href="/static/css/style.css">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <style>
            /* Fallback critical styles in case static CSS fails to load */
            body { background-color: #050505; color: #e0e0e0; font-family: sans-serif; }
            .sidebar { width: 280px; background: #0a0a0a; height: 100vh; border-right: 1px solid #1a1a1a; }
        </style>
    </head>
    <body class="flex">
        <aside class="sidebar">
            <div class="sidebar-logo p-8 flex items-center gap-4">
                <div class="ai-icon-box w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <i data-lucide="layout-grid" class="text-white w-6 h-6"></i>
                </div>
                <span class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</span>
            </div>
            
            <nav class="sidebar-nav px-4 flex-grow">
                <div class="nav-section-title text-[10px] uppercase tracking-widest text-neutral-600 mb-6 font-bold px-4">Operational Scopes</div>
                <a href="#" class="nav-item active flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium">
                    <i data-lucide="terminal" class="w-4 h-4 text-blue-400"></i>
                    Neural Console
                </a>
            </nav>

            <div class="status-card m-6 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl mt-auto">
                <div class="status-indicator flex items-center gap-2 mb-2">
                    <div class="dot w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span class="status-label text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Uplink Stable</span>
                </div>
                <div class="text-[9px] text-neutral-500 font-mono uppercase">v0.0.1-alpha // 2026</div>
            </div>
        </aside>

        <main class="main-content flex-grow flex flex-col relative bg-[#050505]">
            <header class="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-xl">
                <div class="header-meta flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                    <i data-lucide="activity" class="w-4 h-4 text-blue-500"></i>
                    Station: DSP-STATION / Workspace: ./hopthread
                </div>
            </header>

            <div id="chatViewport" class="chat-viewport flex-grow overflow-y-auto p-8">
                <div id="chatThread" class="message-thread max-w-[900px] mx-auto w-full">
                    <div class="message ai flex gap-6 p-8 border-b border-[#1a1a1a] opacity-0 translate-y-4">
                        <div class="message-icon w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <i data-lucide="zap" class="text-white w-6 h-6 fill-white"></i>
                        </div>
                        <div class="message-body">
                            <div class="message-tag text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-2">Core Initialization</div>
                            <div class="message-content text-sm leading-relaxed text-neutral-300">Neural link established. All systems are operational. I am Hopthread. How shall we weave the next sequence?</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="input-zone p-8 flex justify-center bg-gradient-to-t from-[#050505] to-transparent">
                <div class="input-bar w-full max-w-[900px] bg-[#0a0a0a] border border-[#1a1a1a] rounded-[24px] flex items-end p-3 shadow-2xl focus-within:border-blue-500 transition-all">
                    <textarea id="taskInput" rows="1" class="flex-grow bg-transparent border-none outline-none text-white font-mono text-sm p-3 resize-none max-h-[200px]" placeholder="Define a new thread task..."></textarea>
                    <button onclick="weave()" class="send-btn w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-[18px] flex items-center justify-center transition-all active:scale-95">
                        <i data-lucide="arrow-up" class="w-6 h-6"></i>
                    </button>
                </div>
            </div>
        </main>

        <script src="/static/js/main.js"></script>
    </body>
    </html>
    `;

    app.get('/', (c) => c.html(html));

    app.post('/api/weave', async (c) => {
        const { task } = await c.req.json();
        console.log(chalk.cyan(`[WEB] Incoming thread: ${task}`));
        try {
            const response = await getPulse(task);
            return c.json({ response });
        } catch (err: any) {
            return c.json({ response: "Execution Error: " + err.message }, 500);
        }
    });

    const port = 3000;
    console.log(chalk.blue(`\n🌒 Hopthread Console starting on http://localhost:${port}`));

    serve({ fetch: app.fetch, port });
}
