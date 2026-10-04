import React from "react";
import { GitBranch, ShieldCheck, Cpu, Terminal, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default function StatusBar({
  activeFile,
  lineCount,
  language,
  backendOnline,
  ollamaOnline,
  modelName,
  semgrepAvailable,
  problemsCount = 0,
  onToggleTerminal,
  onOpenProblems,
  isTerminalOpen
}) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className="status-item font-medium">
          <GitBranch size={12} /> main
        </span>
        <span className="status-sep">|</span>

        <button
          className={`status-btn ${isTerminalOpen ? "active" : ""}`}
          onClick={onToggleTerminal}
          title="Toggle Bottom Panel (Output / Problems / Analysis)"
        >
          <Terminal size={12} /> Bottom Panel
        </button>

        <span className="status-sep">|</span>

        <button
          className={`status-btn ${problemsCount > 0 ? "text-yellow" : ""}`}
          onClick={onOpenProblems}
          title="View Semgrep Static Analysis Problems"
        >
          <ShieldAlert size={12} />
          <span>{problemsCount} Problems</span>
        </button>

        <span className="status-sep">|</span>

        <span className="status-item text-emerald" title="Your code stays on this device">
          <ShieldCheck size={12} /> Privacy First (Offline)
        </span>
      </div>

      <div className="status-right">
        <span className="status-item">
          {ollamaOnline ? (
            <span className="ai-badge online" title="Local Ollama AI Connected - Zero Cloud Transmission">
              <span className="badge-dot" /> 🟢 {modelName}
            </span>
          ) : (
            <span className="ai-badge offline" title="Ollama offline. Run 'ollama serve' locally.">
              <AlertCircle size={11} /> Ollama Disconnected
            </span>
          )}
        </span>

        <span className="status-sep">|</span>
        <span className="status-item">{lineCount} lines</span>
        <span className="status-sep">|</span>
        <span className="status-item uppercase font-mono">{language}</span>
        <span className="status-sep">|</span>
        <span className="status-item">UTF-8</span>
      </div>
    </footer>
  );
}
