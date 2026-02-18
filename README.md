# 🌒 Hopthread

**Hopthread** is a high-fidelity, agentic AI framework built for the next generation of digital ecosystems. It is designed to be the "thread" that connects intelligent thought (LLMs) to technical execution (System/OS).

Built with **Bun** for ultra-fast performance and **Groq** for high-velocity intelligence.

---

## 🏗️ Architecture

Hopthread is structured into three core modules:

1.  **The Loom (CLI):** The command-line interface where threads are spun.
2.  **The Pulse (AI Brain):** The core agentic loop powered by Groq (Llama-3.3-70B) with native function-calling capabilities.
3.  **The Hand (System Tools):** The execution layer that allows the agent to run shell commands and manipulate the filesystem.

---

## 🧶 The Four Weaves (Killer Features)

Hopthread doesn't just read code; it weaves it into actionable intelligence:

1.  **Codebase Synthesis (BRIEFING.md):** Instant high-fidelity architectural summaries of any folder.
2.  **The Architect's Redline:** Automatic detection of friction, redundant logic, and potential bugs.
3.  **Visual Mapping (DIAGRAM.md):** Auto-generated Mermaid.js diagrams of module relationships.
4.  **Context Condenser (.ht-context):** A token-optimized snapshot for pasting into other LLMs (Claude/ChatGPT).
5.  **Intelligence Graft:** Targeted suggestions for where and how to integrate AI into your specific app.

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) runtime installed.
- A [Groq API Key](https://console.groq.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dsp023/hopthread.git
    cd hopthread
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    ```

---

## 🧶 Usage

You interact with Hopthread through **The Loom**.

### Check System Pulse
```bash
bun run ./src/cli/loom.ts pulse
```

### Weave a Full Synthesis
This command initiates the "Four Weaves" cycle. Hopthread will scan, analyze, and generate all technical docs automatically.

```bash
bun run ./src/cli/loom.ts weave "Synthesize the codebase at /path/to/your/project"
```

---

Built by **Dsp** & **Anya**. 🌒
