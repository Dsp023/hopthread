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
    <title>HOPTHREAD | STUDIO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        :root {
            --bg: #e0e5ec;
            --text: #31344b;
            --accent: #3b82f6;
            --shadow-light: #ffffff;
            --shadow-dark: #a3b1c6;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow: hidden;
            height: 100vh;
        }

        .skeuo-base {
            background: var(--bg);
            box-shadow: 9px 9px 16px var(--shadow-dark), -9px -9px 16px var(--shadow-light);
            border-radius: 20px;
        }

        .skeuo-inset {
            background: var(--bg);
            box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
            border-radius: 15px;
        }

        .skeuo-btn {
            background: var(--bg);
            box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
            border-radius: 12px;
            transition: all 0.2s ease;
        }

        .skeuo-btn:active {
            box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
            transform: scale(0.98);
        }

        .chat-container {
            height: calc(100vh - 180px);
            scrollbar-width: none;
        }
        .chat-container::-webkit-scrollbar { display: none; }

        .message-bubble {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            opacity: 0;
            transform: translateY(10px);
        }

        .ai-icon {
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
        }
        .floating { animation: float 4s ease-in-out infinite; }
    </style>
</head>
<body class="flex flex-col p-4 md:p-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8 px-4">
        <div class="flex items-center gap-4">
            <div class="skeuo-base p-3 floating ai-icon">
                🧶
            </div>
            <div>
                <h1 class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</h1>
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Skeuo_OS_v0.1</p>
            </div>
        </div>
        <div class="skeuo-base px-6 py-2 text-[10px] font-bold uppercase tracking-widest">Station: DSP</div>
    </header>

    <!-- Chat Area -->
    <main id="chatContainer" class="chat-container flex-grow overflow-y-auto px-2 md:px-12 py-4 flex flex-col items-center">
        <div class="w-full max-w-4xl" id="chatList">
            <div class="message-bubble skeuo-base ai-msg flex gap-6 items-start">
                <div class="skeuo-inset p-3 ai-icon flex-shrink-0">🧶</div>
                <div class="flex-grow pt-2">
                    <div class="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Pulse System</div>
                    <div class="text-sm font-medium leading-relaxed">The thread is ready. I have fully tactile system access. How shall we weave?</div>
                </div>
            </div>
        </div>
    </main>

    <!-- Input -->
    <footer class="p-4 flex justify-center">
        <div class="skeuo-inset w-full max-w-4xl flex items-end p-2 pr-4">
            <textarea id="taskInput" rows="1" class="flex-grow bg-transparent p-4 outline-none text-sm font-medium resize-none h-14" placeholder="Command the thread..."></textarea>
            <div class="pb-2">
                <button onclick="weave()" id="weaveBtn" class="skeuo-btn p-4 text-blue-500 hover:text-blue-600 transition-colors">
                    <i data-lucide="send" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    </footer>

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
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                weave();
            }
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
            } catch (err) {
                updateMessage(loadingId, "Thread interrupted: " + err);
            }
        }

        function addMessage(text, role, isLoading = false) {
            const id = 'msg-' + Date.now();
            const list = document.getElementById('chatList');
            const div = document.createElement('div');
            div.id = id;
            div.className = \`message-bubble skeuo-base flex gap-6 items-start \${role === 'user' ? 'bg-white/40' : ''}\`;
            
            const icon = role === 'user' ? '👤' : '🧶';
            const tag = role === 'user' ? 'User Instruction' : 'Pulse Response';
            const tagColor = role === 'user' ? 'text-neutral-500' : 'text-blue-500';

            div.innerHTML = \`
                <div class="skeuo-inset p-3 ai-icon flex-shrink-0">\${icon}</div>
                <div class="flex-grow pt-2">
                    <div class="text-[10px] font-black uppercase tracking-widest \${tagColor} mb-2">\${tag}</div>
                    <div class="text-sm font-medium leading-relaxed \${isLoading ? 'animate-pulse' : ''}">\${text}</div>
                </div>
            \`;
            
            list.appendChild(div);
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

        function scrollToBottom() {
            chatContainer.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
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
console.log(chalk.blue(`\n🌒 Hopthread Console starting on http://localhost:${port}`));

serve({
  fetch: app.fetch,
  port
});
