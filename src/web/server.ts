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
        rewriteRequestPath: (path) => path.replace(/^\/static/, 'src/web/public')
    }));

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HOPTHREAD | CONSOLE</title>
        <link rel="stylesheet" href="/static/css/style.css">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    </head>
    <body>
        <aside class="sidebar">
            <div class="sidebar-logo">
                <div class="ai-icon-box">
                    <i data-lucide="layout-grid" class="text-white w-6 h-6"></i>
                </div>
                <span class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</span>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section-title">Operational Scopes</div>
                <a href="#" class="nav-item active">
                    <i data-lucide="terminal" class="w-4 h-4"></i>
                    Neural Console
                </a>
                <a href="#" class="nav-item">
                    <i data-lucide="git-branch" class="w-4 h-4"></i>
                    Thread History
                </a>
                <a href="#" class="nav-item">
                    <i data-lucide="settings" class="w-4 h-4"></i>
                    Core Config
                </a>
            </nav>

            <div class="status-card">
                <div class="status-indicator">
                    <div class="dot"></div>
                    <span class="status-label">Uplink Stable</span>
                </div>
                <div class="text-[10px] text-neutral-500 font-mono uppercase">v0.0.1-alpha // 2026</div>
            </div>
        </aside>

        <main class="main-content">
            <header>
                <div class="header-meta">
                    <i data-lucide="activity" class="w-4 h-4 text-blue-500"></i>
                    Station: DSP-STATION / Workspace: ./hopthread
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Main Processor</span>
                </div>
            </header>

            <div id="chatViewport" class="chat-viewport">
                <div id="chatThread" class="message-thread">
                    <div class="message ai">
                        <div class="message-icon">
                            <i data-lucide="zap" class="text-white w-6 h-6 fill-white"></i>
                        </div>
                        <div class="message-body">
                            <div class="message-tag">Core Initialization</div>
                            <div class="message-content">Neural link established. All systems are operational. I am Hopthread. How shall we weave the next sequence?</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="input-zone">
                <div class="input-bar">
                    <textarea id="taskInput" rows="1" placeholder="Define a new thread task..."></textarea>
                    <button onclick="weave()" class="send-btn">
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
