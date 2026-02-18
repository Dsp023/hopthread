#  Hopthread 🧶 

**Hopthread** is a high-fidelity, agentic AI framework built for the next generation of digital ecosystems. It is designed to be the "thread" that connects intelligent thought (LLMs) to technical execution (System/OS).

Built with **Bun** for ultra-fast performance and **Groq** for high-velocity intelligence.

---

## 🏗️ Architecture

Hopthread is structured into three core modules:

1.  **The Loom (CLI):** The command-line interface where threads are spun.
2.  **The Pulse (AI Brain):** The core agentic loop powered by Groq (Llama-3.3-70B) with native function-calling capabilities.
3.  **The Hand (System Tools):** The execution layer that allows the agent to run shell commands and manipulate the filesystem.

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

4.  **Global Link (Optional):**
    ```bash
    bun link
    ```

---

##  Usage

You interact with Hopthread through **The Loom**.

### Check System Pulse
```bash
bun run ./src/cli/loom.ts pulse
```

### Weave an Autonomous Task
This command initiates the agentic loop. Hopthread will think, decide which tools to use, and execute them automatically.

```bash
bun run ./src/cli/loom.ts weave "List the files in this directory and create a summary.txt with the count"
```

---

## 🖐️ The Hand (Tools)

Hopthread currently has the following capabilities:
- **execute_shell:** Run any bash/cmd command.
- **write_file:** Create or modify local files.
- **read_file:** Ingest local file data for analysis.

---

## 🛠️ Roadmap
- [ ] **The Echo:** Implement RAG-based long-term memory.
- [ ] **Specialists:** Pre-configured agent personas for specific stacks (React, Python, DevOps).
- [ ] **Web Integration:** Allow Hopthread to fetch and analyze live URLs.

---

Built by **Dsp** . 
