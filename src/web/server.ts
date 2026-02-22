import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getPulse } from '../core/pulse';
import { TheEye } from '../tools/eye';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

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
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="//unpkg.com/force-graph"></script>
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
        
        #neural-map { position: fixed; inset: 0; z-index: -1; opacity: 0.3; pointer-events: none; transition: all 0.5s ease; }
        .map-active #neural-map { opacity: 1; z-index: 50; pointer-events: auto; background: var(--bg); }
        .map-active .main-content, .map-active .sidebar { opacity: 0.1; filter: blur(5px); pointer-events: none; }

        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-blur: 10px; z-index: 100; display: none; align-items: center; justify-content: center; padding: 2rem; }
        .modal.active { display: flex; }
        .modal-content { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 3rem; }
        .markdown h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem; color: var(--accent); }
        .markdown h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: white; }
        .markdown p { margin-bottom: 1rem; color: #a0a0a0; line-height: 1.6; }
        .markdown ul { list-style: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .markdown li { margin-bottom: 0.5rem; color: #e0e0e0; }
    </style>
</head>
<body class="flex">
    <div id="neural-map"></div>

    <div id="usecase-modal" class="modal" onclick="closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
            <div id="usecase-render" class="markdown"></div>
            <button onclick="toggleModal(false)" class="mt-8 px-6 py-2 bg-neutral-800 rounded-lg text-sm font-bold uppercase tracking-widest">Close</button>
        </div>
    </div>
    
    <aside class="sidebar p-6 transition-all duration-500">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <i data-lucide="layout-grid" class="text-white w-6 h-6"></i>
            </div>
            <span class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</span>
        </div>
        <nav class="flex-grow space-y-2">
            <div class="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4">Core System</div>
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors" onclick="toggleMap(false)">
                <i data-lucide="terminal" class="w-4 h-4 text-blue-400"></i> Console
            </div>
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors" onclick="toggleMap(true)">
                <i data-lucide="share-2" class="w-4 h-4 text-emerald-400"></i> Neural Map
            </div>
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors" onclick="toggleModal(true)">
                <i data-lucide="lightbulb" class="w-4 h-4 text-yellow-400"></i> Use Cases
            </div>
        </nav>
        <div class="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 mt-auto">
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">Uplink Stable</span>
            </div>
        </div>
    </aside>

    <main class="flex-grow flex flex-col transition-all duration-500 main-content">
        <header class="p-6 border-b border-border bg-surface/50 backdrop-blur-md flex justify-between items-center">
            <div class="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-blue-500"></i> Station: DSP-STATION
            </div>
            <div class="flex items-center gap-4">
                <button onclick="toggleMap(true)" class="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-all">
                    Visual View
                </button>
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

    <div id="map-close" class="fixed top-8 right-8 z-[100] hidden">
        <button onclick="toggleMap(false)" class="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
    </div>

    <script>
        let graphInstance = null;

        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            gsap.to(".message", { opacity: 1, y: 0, duration: 0.8 });
            initGraph();
            refreshMap();
        });

        function toggleMap(active) {
            if (active) {
                document.body.classList.add('map-active');
                document.getElementById('map-close').classList.remove('hidden');
                refreshMap();
            } else {
                document.body.classList.remove('map-active');
                document.getElementById('map-close').classList.add('hidden');
            }
        }

        async function toggleModal(active) {
            const modal = document.getElementById('usecase-modal');
            if (active) {
                const res = await fetch('/api/use-cases');
                const data = await res.json();
                document.getElementById('usecase-render').innerHTML = marked.parse(data.content);
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
            }
        }

        function closeModal(e) {
            toggleModal(false);
        }

        async function refreshMap() {
            try {
                const res = await fetch('/api/map');
                const data = await res.json();
                if (graphInstance) graphInstance.graphData(data);
            } catch (err) { console.error("Map Load Failed", err); }
        }

        function initGraph() {
            graphInstance = ForceGraph()(document.getElementById('neural-map'))
                .nodeId('id')
                .nodeLabel('label')
                .nodeAutoColorBy('group')
                .linkDirectionalArrowLength(6)
                .linkDirectionalArrowRelPos(1)
                .backgroundColor('#020203')
                .linkColor(() => '#1a1a1a')
                .nodeCanvasObject((node, ctx, globalScale) => {
                    const label = node.label;
                    const fontSize = 12/globalScale;
                    ctx.font = \`\${fontSize}px "JetBrains Mono"\`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    ctx.fillStyle = 'rgba(10, 10, 12, 0.8)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions;
                })
                .nodePointerAreaPaint((node, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                })
                .onNodeClick(node => {
                    if (node.grafts && node.grafts.length > 0) {
                        handleWeave({ text: 'Identify intelligence grafts for ' + node.path });
                    } else {
                        handleWeave({ text: 'Analyze the file ' + node.path });
                    }
                });
        }

        const input = document.getElementById('taskInput');
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWeave(); }
        });

        async function handleWeave(override = null) {
            const task = override ? override.text : input.value.trim();
            if (!task) return;

            addMessage(task, 'user');
            if (!override) {
                input.value = '';
                input.style.height = 'auto';
            }

            const loadingId = addMessage('Processing thread sequence...', 'ai', true);

            try {
                const res = await fetch('/api/weave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task })
                });
                const data = await res.json();
                updateMessage(loadingId, data.response);
                if (task.toLowerCase().includes('map') || task.toLowerCase().includes('visual')) refreshMap();
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

    app.get('/api/map', async (c) => {
        const data = await TheEye.generateDiagram('./');
        const grafts = await TheEye.identifyGrafts('./');
        
        // Add graft data to nodes
        data.nodes = data.nodes.map(node => {
            const nodeGrafts = grafts.filter(g => g.file === node.path);
            if (nodeGrafts.length > 0) {
                return { ...node, grafts: nodeGrafts, color: '#facc15' }; // Glow gold
            }
            return node;
        });

        return c.json(data);
    });

    app.get('/api/use-cases', async (c) => {
        try {
            const content = fs.readFileSync('./USE_CASES.md', 'utf8');
            return c.json({ content });
        } catch (err) {
            return c.json({ content: "# Use Cases not found.\nRun `analyze use cases` to generate." });
        }
    });

    app.post('/api/weave', async (c) => {
        const { task } = await c.req.json();
        console.log(chalk.cyan(`[WEB] Incoming: ${task}`));
        try {
            if (task.startsWith('tadow ')) {
                const { Tadow } = await import('../tools/tadow');
                const response = await Tadow.vibe(task.replace('tadow ', ''));
                return c.json({ response });
            }
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
