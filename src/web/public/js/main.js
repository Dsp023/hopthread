document.addEventListener('DOMContentLoaded', () => {
    console.log("Hopthread Console: Logic Initialized");
    
    // Ensure Lucide icons are created
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    const input = document.getElementById('taskInput');
    const viewport = document.getElementById('chatViewport');
    const chatThread = document.getElementById('chatThread');
    
    // GSAP initial animation
    if (window.gsap) {
        window.gsap.to(".message", { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 });
    } else {
        // Fallback if GSAP is blocked/missing
        document.querySelectorAll('.message').forEach(m => m.style.opacity = '1');
    }

    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    });

    // Handle Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            weave();
        }
    });

    async function weave() {
        const task = input.value.trim();
        if (!task) return;

        console.log("Weaving thread:", task);

        // Add User Message
        addMessage(task, 'user');
        
        // Reset Input
        input.value = '';
        input.style.height = 'auto';

        // Add Loading AI Message
        const loadingId = addMessage('Processing thread sequence...', 'ai', true);
        
        try {
            const response = await fetch('/api/weave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task })
            });

            if (!response.ok) throw new Error('Gateway Timeout');
            
            const data = await response.json();
            updateMessage(loadingId, data.response);
        } catch (err) {
            console.error("Critical Failure:", err);
            updateMessage(loadingId, "Critical Failure: " + err.message);
        }
    }

    function addMessage(text, role, isLoading = false) {
        const id = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `message \${role} flex gap-6 p-8 border-b border-[#1a1a1a]`;
        
        const icon = role === 'user' ? 'user' : 'zap';
        const tag = role === 'user' ? 'Instruction Buffer' : 'Pulse Response';
        const iconBg = role === 'ai' ? 'bg-blue-600' : 'bg-[#1a1a1a]';
        
        div.innerHTML = `
            <div class="message-icon w-12 h-12 rounded-2xl \${iconBg} flex items-center justify-center flex-shrink-0 shadow-lg">
                <i data-lucide="\${icon}" class="text-white w-6 h-6 \${role === 'ai' ? 'fill-white' : ''}"></i>
            </div>
            <div class="message-body">
                <div class="message-tag text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-2">\${tag}</div>
                <div class="message-content text-sm leading-relaxed \${role === 'ai' ? 'text-neutral-300' : 'text-white font-medium'} \${isLoading ? 'animate-pulse opacity-50' : ''}">\${formatText(text)}</div>
            </div>
        `;
        
        chatThread.appendChild(div);
        
        if (window.lucide) window.lucide.createIcons();
        
        if (window.gsap) {
            window.gsap.to(div, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        } else {
            div.style.opacity = '1';
        }

        scrollToBottom();
        return id;
    }

    function updateMessage(id, text) {
        const msg = document.getElementById(id);
        if (!msg) return;
        
        const contentDiv = msg.querySelector('.message-content');
        contentDiv.innerHTML = formatText(text);
        contentDiv.classList.remove('animate-pulse', 'opacity-50');
        
        // Re-run Mermaid for updated content
        if (text.includes('graph TD') || text.includes('graph LR')) {
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid mt-4 bg-black/40 p-4 rounded-xl border border-white/5';
            mermaidDiv.textContent = text.match(/(graph [\s\S]*)/)[0];
            contentDiv.appendChild(mermaidDiv);
            
            // Try to load/run Mermaid
            if (window.mermaid) {
                window.mermaid.run();
            } else {
                import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs').then(m => {
                    m.default.initialize({ startOnLoad: true, theme: 'dark' });
                    m.default.run();
                });
            }
        }
        
        scrollToBottom();
    }

    function formatText(text) {
        if (!text) return "";
        // Basic markdown code block replacement
        return text.replace(/\\`\\`\\`([\\s\\S]*?)\\`\\`\\`/g, '<pre class="bg-black p-4 rounded-xl border border-[#111] mt-4 overflow-x-auto"><code class="font-mono text-blue-400 text-xs">$1</code></pre>');
    }

    function scrollToBottom() {
        viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Explicitly attach to window for the button's onclick="weave()"
    window.weave = weave;
});
