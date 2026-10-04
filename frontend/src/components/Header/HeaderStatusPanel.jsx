import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Cpu,
  Server,
  ShieldCheck,
  Terminal,
  Lock,
  X
} from "lucide-react";

export default function HeaderStatusPanel({
  healthData,
  isChecking,
  onRetry,
  onClose
}) {
  const [copiedCmd, setCopiedCmd] = useState(null);

  const ollamaStatus = healthData?.ollama_status || "offline";
  const modelName = healthData?.model || "qwen2.5-coder:7b";
  const modelAvailable = healthData?.model_available || false;
  const semgrepAvailable = healthData?.semgrep_available || false;
  const semgrepVersion = healthData?.semgrep_version;

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getStatusBadge = () => {
    if (isChecking) {
      return (
        <span className="status-badge loading">
          <Loader2 size={13} className="spin" /> Checking local runtime...
        </span>
      );
    }
    if (ollamaStatus === "connected" && modelAvailable) {
      return (
        <span className="status-badge connected">
          <CheckCircle2 size={13} /> 🟢 LOCAL AI ACTIVE
        </span>
      );
    }
    if (ollamaStatus === "model_missing") {
      return (
        <span className="status-badge missing">
          <AlertCircle size={13} /> Model Missing: {modelName}
        </span>
      );
    }
    return (
      <span className="status-badge offline">
        <XCircle size={13} /> Offline — Ollama Disconnected
      </span>
    );
  };

  return (
    <div className="status-popover">
      <div className="popover-header">
        <div className="title-area">
          <ShieldCheck size={16} className="text-emerald" />
          <h4>Local AI & Privacy Diagnostic</h4>
        </div>
        <button className="icon-close" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      <div className="popover-body">
        <div className="status-summary-box">
          {getStatusBadge()}
          <p className="status-msg-detail">{healthData?.message || "Inspecting local runtime..."}</p>
        </div>

        {/* Privacy First highlight */}
        <div className="privacy-highlight-banner">
          <Lock size={14} className="text-emerald" />
          <div>
            <strong>Your code stays on this device.</strong>
            <p>Inference runs 100% locally through Ollama without sending code to cloud AI.</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">
              <Cpu size={12} /> LLM Engine:
            </span>
            <span className="info-val font-mono">{modelName}</span>
          </div>

          <div className="info-item">
            <span className="info-label">
              <Server size={12} /> Ollama Service:
            </span>
            <span className={`info-val capital ${ollamaStatus}`}>
              {ollamaStatus === "connected" ? "Connected (127.0.0.1:11434)" : ollamaStatus}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">
              <Terminal size={12} /> Semgrep Static Engine:
            </span>
            <span className={`info-val ${semgrepAvailable ? "text-emerald" : "text-yellow"}`}>
              {semgrepAvailable ? `Active (${semgrepVersion || "v1.179+"})` : "Not Found"}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">
              <ShieldCheck size={12} /> Privacy Mode:
            </span>
            <span className="info-val text-emerald">100% Local Inference</span>
          </div>
        </div>

        {ollamaStatus !== "connected" && (
          <div className="setup-guide-box">
            <h5>🚀 Local AI Setup</h5>
            <ol className="setup-steps">
              <li>
                <strong>1. Start Ollama:</strong> Open PowerShell and run:
                <div className="code-copy-row">
                  <code>ollama serve</code>
                  <button
                    className="copy-btn-mini"
                    onClick={() => copyToClipboard("ollama serve", "serve")}
                  >
                    {copiedCmd === "serve" ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </li>
              <li>
                <strong>2. Pull Model:</strong>
                <div className="code-copy-row">
                  <code>ollama pull {modelName}</code>
                  <button
                    className="copy-btn-mini"
                    onClick={() => copyToClipboard(`ollama pull ${modelName}`, "pull")}
                  >
                    {copiedCmd === "pull" ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>

      <div className="popover-footer">
        <button
          className="btn-retry"
          onClick={onRetry}
          disabled={isChecking}
        >
          <RotateCcw size={13} className={isChecking ? "spin" : ""} />
          <span>{isChecking ? "Checking..." : "Re-check Connection"}</span>
        </button>
      </div>
    </div>
  );
}
