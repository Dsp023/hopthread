document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const input = document.getElementById('taskInput');
    const viewport = document.getElementById('chatViewport');
    const chatThread = document.getElementById('chatThread');
    
    // Initial animation
    gsap.to(".message", { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 });

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
            updateMessage(loadingId, "Critical Failure: " + err.message);
        }
    }

    function addMessage(text, role, isLoading = false) {
        const id = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `message ${role}`;
        
        const icon = role === 'user' ? 'user' : 'zap';
        const tag = role === 'user' ? 'Instruction Buffer' : 'Pulse Response';
        
        div.innerHTML = `
            <div class="message-icon">
                <i data-lucide="${icon}" class="text-white w-6 h-6 ${role === 'ai' ? 'fill-white' : ''}"></i>
            </div>
            <div class="message-body">
                <div class="message-tag">${tag}</div>
                <div class="message-content ${isLoading ? 'animate-pulse opacity-50' : ''}">${formatText(text)}</div>
            </div>
        `;
        
        chatThread.appendChild(div);
        lucide.createIcons();
        
        // Initialize Mermaid if found
        if (text.includes('graph TD') || text.includes('graph LR')) {
            import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs').then(m => {
                m.default.initialize({ startOnLoad: true, theme: 'dark' });
                m.default.run();
            });
        }

        gsap.to(div, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        scrollToBottom();
        
        return id;
    }

    function updateMessage(id, text) {
        const msg = document.getElementById(id);
        const contentDiv = msg.querySelector('.message-content');
        contentDiv.innerHTML = formatText(text);
        contentDiv.classList.remove('animate-pulse', 'opacity-50');
        
        // Re-run Mermaid for updated content
        if (text.includes('graph TD') || text.includes('graph LR')) {
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid mt-4 bg-black/40 p-4 rounded-xl border border-white/5';
            mermaidDiv.textContent = text.match(/(graph [\s\S]*)/)[0];
            contentDiv.appendChild(mermaidDiv);
            
            import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs').then(m => {
                m.default.run();
            });
        }
        
        scrollToBottom();
    }

    function formatText(text) {
        // Simple markdown-ish code block detection
        if (text.includes('```')) {
            return text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        }
        return text;
    }

    function scrollToBottom() {
        viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Expose for button click
    window.weave = weave;
});
