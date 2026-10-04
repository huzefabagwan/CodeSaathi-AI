import React from "react";
import { GitBranch, ShieldCheck, Cpu, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

export default function StatusBar({
  activeFile,
  lineCount,
  language,
  backendOnline,
  ollamaOnline,
  modelName,
  notice,
  onToggleTerminal,
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
        >
          <Terminal size={12} /> Terminal
        </button>
        <span className="status-sep">|</span>
        <span className="status-item text-emerald">
          <ShieldCheck size={12} /> CodeSaathi Active
        </span>
      </div>

      <div className="status-right">
        <span className="status-item">
          {ollamaOnline ? (
            <span className="ai-badge online" title="Local Ollama AI Connected">
              <span className="badge-dot" /> {modelName}
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
        <span className="status-item uppercase">{language}</span>
        <span className="status-sep">|</span>
        <span className="status-item">UTF-8</span>
      </div>
    </footer>
  );
}
