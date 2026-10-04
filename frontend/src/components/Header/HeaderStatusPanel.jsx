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
  Sparkles,
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
  const modelName = healthData?.model || "qwen2.5-coder:3b";
  const backendStatus = healthData?.backend_status || "offline";

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getStatusBadge = () => {
    if (isChecking) {
      return (
        <span className="status-badge loading">
          <Loader2 size={13} className="spin" /> Checking local AI...
        </span>
      );
    }
    if (ollamaStatus === "connected") {
      return (
        <span className="status-badge connected">
          <CheckCircle2 size={13} /> Connected — Local AI Ready
        </span>
      );
    }
    if (ollamaStatus === "model_missing") {
      return (
        <span className="status-badge missing">
          <AlertCircle size={13} /> Model Missing — Setup Required
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
          <Sparkles size={16} className="text-emerald" />
          <h4>Local AI Status & Diagnostic</h4>
        </div>
        <button className="icon-close" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      <div className="popover-body">
        <div className="status-summary-box">
          {getStatusBadge()}
          <p className="status-msg-detail">{healthData?.message || "Checking server status..."}</p>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">
              <Cpu size={12} /> Active Model:
            </span>
            <span className="info-val font-mono">{modelName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">
              <Server size={12} /> Ollama Service:
            </span>
            <span className={`info-val capital ${ollamaStatus}`}>{ollamaStatus}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Backend API:</span>
            <span className="info-val text-emerald">http://localhost:8000</span>
          </div>
        </div>

        {ollamaStatus !== "connected" && (
          <div className="setup-guide-box">
            <h5>🚀 Beginner Setup Instructions</h5>
            <ol className="setup-steps">
              <li>
                <strong>1. Install Ollama:</strong> Download from{" "}
                <a href="https://ollama.com" target="_blank" rel="noreferrer">
                  ollama.com
                </a>.
              </li>
              <li>
                <strong>2. Pull Model:</strong> Open PowerShell and run:
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
              <li>
                <strong>3. Verify:</strong> Confirm model installation:
                <div className="code-copy-row">
                  <code>ollama list</code>
                  <button
                    className="copy-btn-mini"
                    onClick={() => copyToClipboard("ollama list", "list")}
                  >
                    {copiedCmd === "list" ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </li>
            </ol>
            <div className="privacy-note-mini">
              ℹ️ <em>Download requires internet once, but AI inference runs 100% offline.</em>
            </div>
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
          <span>{isChecking ? "Checking..." : "Retry Connection Check"}</span>
        </button>
      </div>
    </div>
  );
}
