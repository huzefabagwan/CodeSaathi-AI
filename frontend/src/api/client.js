// CodeSaathi AI - Centralized Frontend API Client

const BASE_URL = "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      throw new Error("Could not connect to CodeSaathi backend at http://localhost:8000. Is the backend running?");
    }
    throw err;
  }
}

export const api = {
  /** Check status of backend, Ollama, Qwen2.5-Coder model, and Semgrep */
  async checkHealth() {
    return request("/api/health", { method: "GET" });
  },

  /** Chat with local Qwen2.5-Coder model */
  async sendChat({ message, code = "", filename = "main.py", language = "python", history = [], model = null }) {
    return request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, code, filename, language, history, model })
    });
  },

  /** Run specialized AI action (Explain, Debug, Find Bugs, Fix, Optimize, Tests, Security, Complexity) */
  async analyzeCode({ code, language = "python", filename = "main.py", action = "find_bugs", history = [], model = null }) {
    return request("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ code, language, filename, action, history, model })
    });
  },

  /** Run local Semgrep static analysis safely without code execution */
  async runStaticAnalysis({ code, language = "python", filename = "main.py" }) {
    return request("/api/static-analysis", {
      method: "POST",
      body: JSON.stringify({ code, language, filename })
    });
  },

  /** Combined Review: Semgrep static analysis findings + Qwen2.5-Coder local intelligence */
  async runCombinedReview({ code, language = "python", filename = "main.py", model = null }) {
    return request("/api/review", {
      method: "POST",
      body: JSON.stringify({ code, language, filename, model })
    });
  },

  /** Safely execute Python code in local temporary environment */
  async runCode({ code, filename = "main.py" }) {
    return request("/api/run", {
      method: "POST",
      body: JSON.stringify({ code, filename })
    });
  }
};

export default api;
