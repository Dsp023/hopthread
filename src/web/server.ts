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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');

        :root {
            --bg: #ffffff;
            --text: #1a1a1a;
            --accent: #ff3e00;
            --subtle: #f5f5f7;
            --border: #eeeeee;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        .fudali-card {
            border-radius: 40px;
            background: var(--subtle);
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-title {
            font-size: clamp(2.5rem, 8vw, 6rem);
            font-weight: 800;
            line-height: 0.9;
            letter-spacing: -0.04em;
        }

        .btn-weave {
            background: var(--text);
            color: white;
            padding: 20px 40px;
            border-radius: 100px;
            font-weight: 700;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            letter-spacing: 0.05em;
        }

        .btn-weave:hover {
            background: var(--accent);
            transform: scale(1.02) translateY(-2px);
        }

        .input-area {
            background: transparent;
            border: 2px solid var(--border);
            border-radius: 30px;
            transition: border-color 0.3s ease;
        }

        .input-area:focus-within {
            border-color: var(--accent);
        }

        .reveal { opacity: 0; transform: translateY(30px); }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: white; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

        .tag-pill {
            padding: 6px 16px;
            border-radius: 100px;
            background: white;
            border: 1px solid var(--border);
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
    </style>
</head>
<body class="p-6 md:p-12">
    <nav class="flex justify-between items-center mb-24 reveal">
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#ff3e00] rounded-full"></div>
            <span class="font-extrabold text-xl tracking-tighter uppercase">Hopthread</span>
        </div>
        <div class="hidden md:flex gap-10 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <span>Engine_v0.1</span>
            <span>Station_DSP</span>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <!-- Left Side: Hero & Controls -->
            <div class="lg:col-span-7">
                <div class="tag-pill inline-block mb-8 reveal">Synthesis Engine</div>
                <h1 class="hero-title mb-12 reveal">
                    Weave code into <br>
                    <span class="text-[#ff3e00] italic underline decoration-1 underline-offset-[12px]">intelligence.</span>
                </h1>
                
                <div class="input-area p-2 mb-8 reveal">
                    <textarea id="taskInput" class="w-full bg-transparent p-6 text-xl font-medium outline-none h-48 resize-none" placeholder="Enter directory path or synthesis command..."></textarea>
                    <div class="flex justify-end p-2">
                        <button onclick="weave()" id="weaveBtn" class="btn-weave uppercase text-xs">
                            Start Weave
                        </button>
                    </div>
                </div>

                <div class="flex gap-4 reveal">
                    <div class="fudali-card p-6 flex-1 text-center border border-white">
                        <span class="block text-2xl font-extrabold mb-1">01</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Scan</span>
                    </div>
                    <div class="fudali-card p-6 flex-1 text-center border border-white">
                        <span class="block text-2xl font-extrabold mb-1">02</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Synthesize</span>
                    </div>
                    <div class="fudali-card p-6 flex-1 text-center border border-white">
                        <span class="block text-2xl font-extrabold mb-1">03</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Deploy</span>
                    </div>
                </div>
            </div>

            <!-- Right Side: Output -->
            <div class="lg:col-span-5 pt-4">
                <div id="resultBox" class="fudali-card p-10 min-h-[500px] relative reveal overflow-hidden border border-white shadow-xl">
                    <div class="flex justify-between items-center mb-8 border-b border-neutral-200 pb-4">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Output Stream</span>
                        <div id="pulseLight" class="w-2 h-2 bg-neutral-200 rounded-full"></div>
                    </div>
                    <div id="output" class="text-sm font-medium leading-relaxed text-neutral-600 whitespace-pre-wrap">
                        The thread is waiting to be pulled. Enter an instruction to initiate the synthesis cycle.
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        lucide.createIcons();

        // Reveal Animations
        gsap.to(".reveal", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out"
        });
        
        async function weave() {
            const input = document.getElementById('taskInput');
            const btn = document.getElementById('weaveBtn');
            const output = document.getElementById('output');
            const light = document.getElementById('pulseLight');

            if(!input.value) return;

            btn.disabled = true;
            btn.innerHTML = "Woven...";
            light.classList.remove('bg-neutral-200');
            light.classList.add('bg-[#ff3e00]', 'animate-pulse');
            output.innerText = "Synthesizing thread... [ANALYSIS IN PROGRESS]";
            output.classList.add('opacity-50');

            try {
                const response = await fetch('/api/weave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: input.value })
                });
                const data = await response.json();
                
                output.classList.remove('opacity-50');
                output.innerText = data.response;
            } catch (err) {
                output.innerText = "Thread broken: " + err;
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Start Weave';
                light.classList.remove('animate-pulse');
            }
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
