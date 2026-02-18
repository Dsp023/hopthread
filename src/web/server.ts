import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getPulse } from '../core/pulse';
import chalk from 'chalk';

const app = new Hono();

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HOPTHREAD | OS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');

        :root {
            --bg: #000000;
            --text: #ffffff;
            --dim: #666666;
            --border: #111111;
            --accent: #ffffff;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Space Grotesk', sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow: hidden;
            height: 100vh;
        }

        .thread-line {
            position: absolute;
            width: 1px;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
            height: 100vh;
            z-index: 0;
        }

        .chat-container {
            height: calc(100vh - 180px);
            scrollbar-width: none;
        }
        .chat-container::-webkit-scrollbar { display: none; }

        .input-box {
            background: rgba(10, 10, 10, 0.8);
            border: 1px solid var(--border);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            transition: border-color 0.4s ease;
        }

        .input-box:focus-within {
            border-color: #333;
        }

        .message-bubble {
            max-width: 85%;
            margin-bottom: 2rem;
            opacity: 0;
            transform: translateY(10px);
        }

        .ai-text {
            color: #ccc;
            line-height: 1.6;
            font-size: 0.95rem;
        }

        .user-text {
            color: white;
            font-weight: 500;
            text-align: right;
        }

        .pulse-dot {
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px white;
        }

        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
        .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: rgba(255, 255, 255, 0.03);
            animation: scanline 8s linear infinite;
            pointer-events: none;
        }
    </style>
</head>
<body class="flex flex-col">
    <div class="scanline"></div>
    <div class="thread-line" style="left: 10vw"></div>
    <div class="thread-line" style="left: 90vw"></div>

    <!-- Header -->
    <header class="p-8 flex justify-between items-center relative z-10">
        <div class="flex items-center gap-3">
            <span class="text-xs font-bold tracking-[0.4em] uppercase">Hopthread</span>
            <div class="pulse-dot"></div>
        </div>
        <div class="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
            System_Ready_v0.1
        </div>
    </header>

    <!-- Chat Area -->
    <main id="chatContainer" class="chat-container flex-grow overflow-y-auto px-8 md:px-24 py-12 relative z-10 flex flex-col items-center">
        <div class="w-full max-w-3xl" id="chatList">
            <!-- Greeting -->
            <div class="message-bubble w-full ai-msg">
                <div class="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Anyatheard // Pulse</div>
                <div class="ai-text">The thread is initialized. I am ready to analyze, synthesize, or chat. What is our objective?</div>
            </div>
        </div>
    </main>

    <!-- Input Area -->
    <footer class="p-8 md:p-12 relative z-10 flex justify-center">
        <div class="input-box w-full max-w-3xl flex items-center p-2 pr-4">
            <textarea id="taskInput" class="flex-grow bg-transparent p-4 outline-none text-sm resize-none h-12" placeholder="Talk to the thread..."></textarea>
            <button onclick="weave()" id="weaveBtn" class="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
                <i data-lucide="arrow-up" class="w-5 h-5"></i>
            </button>
        </div>
    </footer>

    <script>
        lucide.createIcons();

        // Initial animation
        gsap.to(".ai-msg", { opacity: 1, y: 0, duration: 1 });

        const input = document.getElementById('taskInput');
        
        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });

        // Enter key to send
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                weave();
            }
        });
        
        async function weave() {
            const task = input.value.trim();
            if(!task) return;

            // Add User Message
            addMessage(task, 'user');
            input.value = '';
            input.style.height = 'auto';

            // Loading indicator
            const loadingId = addMessage('...', 'ai', true);

            try {
                const response = await fetch('/api/weave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task })
                });
                const data = await response.json();
                updateMessage(loadingId, data.response);
            } catch (err) {
                updateMessage(loadingId, "Thread broken: " + err);
            }
        }

        function addMessage(text, role, isLoading = false) {
            const id = 'msg-' + Date.now();
            const list = document.getElementById('chatList');
            const div = document.createElement('div');
            div.id = id;
            div.className = \`message-bubble w-full \${role === 'user' ? 'flex flex-col items-end' : ''}\`;
            
            div.innerHTML = \`
                <div class="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">\${role === 'user' ? 'DSP // Vision' : 'Anyatheard // Pulse'}</div>
                <div class="\${role === 'user' ? 'user-text' : 'ai-text'} \${isLoading ? 'animate-pulse' : ''}">\${text}</div>
            \`;
            
            list.appendChild(div);
            gsap.to(div, { opacity: 1, y: 0, duration: 0.5 });
            scrollToBottom();
            return id;
        }

        function updateMessage(id, text) {
            const msg = document.getElementById(id);
            const textDiv = msg.querySelector('.ai-text');
            textDiv.innerText = text;
            textDiv.classList.remove('animate-pulse');
            scrollToBottom();
        }

        function scrollToBottom() {
            const container = document.getElementById('chatContainer');
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
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
console.log(chalk.green(`\n🌒 Hopthread OS starting on http://localhost:${port}`));

serve({
  fetch: app.fetch,
  port
});
