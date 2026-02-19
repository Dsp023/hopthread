import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getPulse } from '../core/pulse';
import chalk from 'chalk';

export function startServer() {
    const app = new Hono();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HOPTHREAD | CONSOLE</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Plus+Jakarta+Sans:wght@200;400;700;800&display=swap');

            :root {
                --bg: #050505;
                --text: #e0e0e0;
                --accent: #3b82f6;
                --accent-glow: rgba(59, 130, 246, 0.2);
                --border: #1a1a1a;
                --terminal: #0a0a0a;
            }

            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: 'Plus Jakarta Sans', sans-serif;
                -webkit-font-smoothing: antialiased;
                overflow: hidden;
                height: 100vh;
            }

            .mono { font-family: 'JetBrains Mono', monospace; }

            .sidebar {
                width: 300px;
                background: var(--terminal);
                border-right: 1px solid var(--border);
            }

            .main-view {
                background: var(--bg);
                flex-grow: 1;
            }

            .input-container {
                background: var(--terminal);
                border: 1px solid var(--border);
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }

            .input-container:focus-within {
                border-color: var(--accent);
                box-shadow: 0 0 15px var(--accent-glow);
            }

            .chat-container {
                height: calc(100vh - 140px);
                scrollbar-width: thin;
                scrollbar-color: #222 transparent;
            }

            .message-bubble {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border);
                opacity: 0;
                transform: translateY(10px);
            }

            .ai-icon {
                background: var(--accent);
                box-shadow: 0 0 10px var(--accent-glow);
            }

            .user-icon {
                background: #333;
            }

            .tag {
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--accent);
                font-weight: 700;
            }

            pre code {
                font-family: 'JetBrains Mono', monospace;
                background: #000;
                display: block;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #111;
                margin-top: 1rem;
            }

            @keyframes pulse-blue {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
            .active-pulse { animation: pulse-blue 2s infinite; }
        </style>
    </head>
    <body class="flex">
        <aside class="sidebar hidden md:flex flex-col p-6">
            <div class="flex items-center gap-3 mb-12">
                <div class="w-8 h-8 ai-icon rounded-lg flex items-center justify-center">
                    <i data-lucide="thread" class="text-white w-5 h-5"></i>
                </div>
                <span class="font-extrabold text-lg tracking-tighter uppercase">Hopthread</span>
            </div>
            <nav class="space-y-2 flex-grow">
                <div class="text-[10px] uppercase tracking-widest text-neutral-600 mb-4 font-bold">Workspace</div>
                <a href="#" class="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-sm font-medium border border-white/5">
                    <i data-lucide="message-square" class="w-4 h-4 text-blue-400"></i> Active Thread
                </a>
            </nav>
            <div class="mt-auto p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 bg-blue-500 rounded-full active-pulse"></div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">Gateway Online</span>
                </div>
            </div>
        </aside>
        <main class="main-view flex flex-col">
            <header class="p-6 border-b border-border flex justify-between items-center bg-terminal/50 backdrop-blur-md">
                <div class="flex items-center gap-4">
                    <i data-lucide="terminal" class="w-4 h-4 text-blue-500"></i>
                    <span class="text-xs font-bold uppercase tracking-widest text-neutral-400">Console / agent:main:main</span>
                </div>
            </header>
            <div id="chatContainer" class="chat-container overflow-y-auto">
                <div class="max-w-4xl mx-auto w-full" id="chatList">
                    <div class="message-bubble flex gap-6 ai-msg">
                        <div class="w-10 h-10 ai-icon rounded-xl flex-shrink-0 flex items-center justify-center">
                            <i data-lucide="zap" class="text-white w-6 h-6 fill-white"></i>
                        </div>
                        <div class="flex-grow">
                            <div class="tag mb-2">System Initialized</div>
                            <div class="text-neutral-300 leading-relaxed">I am Hopthread. How shall we weave?</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 flex justify-center">
                <div class="input-container w-full max-w-4xl flex items-end p-2 pr-4 rounded-2xl">
                    <textarea id="taskInput" rows="1" class="flex-grow bg-transparent p-4 outline-none text-sm resize-none mono h-14" placeholder="Type a command..."></textarea>
                    <button onclick="weave()" id="weaveBtn" class="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20">
                        <i data-lucide="arrow-up" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </main>

        <script>
            lucide.createIcons();
            gsap.to(".ai-msg", { opacity: 1, y: 0, duration: 0.8 });
            const input = document.getElementById('taskInput');
            const chatContainer = document.getElementById('chatContainer');
            
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 200) + 'px';
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); weave(); }
            });

            async function weave() {
                const task = input.value.trim();
                if(!task) return;
                addMessage(task, 'user');
                input.value = '';
                input.style.height = 'auto';
                const loadingId = addMessage('...', 'ai', true);
                try {
                    const response = await fetch('/api/weave', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ task })
                    });
                    const data = await response.json();
                    updateMessage(loadingId, data.response);
                } catch (err) { updateMessage(loadingId, "Thread interrupted: " + err); }
            }

            function addMessage(text, role, isLoading = false) {
                const id = 'msg-' + Date.now();
                const list = document.getElementById('chatList');
                const div = document.createElement('div');
                div.id = id;
                div.className = 'message-bubble flex gap-6';
                const icon = role === 'user' ? 'user' : 'zap';
                const iconClass = role === 'user' ? 'user-icon' : 'ai-icon';
                const tag = role === 'user' ? 'User Instruction' : 'Pulse Response';
                div.innerHTML = \`
                    <div class="w-10 h-10 \${iconClass} rounded-xl flex-shrink-0 flex items-center justify-center">
                        <i data-lucide="\${icon}" class="text-white w-6 h-6 \${role === 'ai' ? 'fill-white' : ''}"></i>
                    </div>
                    <div class="flex-grow">
                        <div class="tag mb-2">\${tag}</div>
                        <div class="\${role === 'ai' ? 'text-neutral-300' : 'text-white font-medium'} \${isLoading ? 'animate-pulse' : ''}">\${text}</div>
                    </div>
                \`;
                list.appendChild(div);
                lucide.createIcons();
                gsap.to(div, { opacity: 1, y: 0, duration: 0.4 });
                scrollToBottom();
                return id;
            }

            function updateMessage(id, text) {
                const msg = document.getElementById(id);
                const contentDiv = msg.querySelector('.flex-grow div:nth-child(2)');
                contentDiv.innerText = text;
                contentDiv.classList.remove('animate-pulse');
                scrollToBottom();
            }

            function scrollToBottom() { chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' }); }
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
    console.log(chalk.blue(`\n🌒 Hopthread Console starting on http://localhost:${port}`));

    serve({ fetch: app.fetch, port });
}
