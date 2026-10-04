import React from "react";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Server,
  Terminal,
  RotateCcw,
  ExternalLink
} from "lucide-react";

export default function SettingsPanel({ healthData, isCheckingHealth, onCheckHealth }) {
  const ollamaStatus = healthData?.ollama_status || "offline";
  const modelName = healthData?.model || "qwen2.5-coder:7b";
  const semgrepAvailable = healthData?.semgrep_available || false;
  const semgrepVersion = healthData?.semgrep_version || "Not detected";

  return (
    <div className="sidebar-subpanel">
      <div className="panel-header">
        <span className="panel-title">SETTINGS & PRIVACY</span>
      </div>

      <div className="panel-scroll-content">
        <div className="settings-section">
          <h4 className="settings-section-title">
            <ShieldCheck size={15} className="text-emerald" /> Privacy Architecture
          </h4>
          <p className="settings-desc">
            CodeSaathi AI is designed with privacy-first principles. Your source code, file paths, and prompts stay on this machine.
          </p>

          <div className="privacy-feature-list">
            <div className="privacy-feature-item">
              <span className="check-dot green" />
              <span>100% Local Inference via Ollama</span>
            </div>
            <div className="privacy-feature-item">
              <span className="check-dot green" />
              <span>Zero Cloud LLM API Calls (No OpenAI, Gemini, Claude)</span>
            </div>
            <div className="privacy-feature-item">
              <span className="check-dot green" />
              <span>Local Open-Source Semgrep Static Analysis</span>
            </div>
            <div className="privacy-feature-item">
              <span className="check-dot green" />
              <span>Isolated Local Code Execution Timeout</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <Cpu size={15} /> Model Configuration
          </h4>

          <div className="setting-field">
            <label>Active Local Model</label>
            <input
              type="text"
              readOnly
              value={modelName}
              className="setting-input font-mono"
            />
          </div>

          <div className="setting-field">
            <label>Ollama Endpoint</label>
            <input
              type="text"
              readOnly
              value="http://127.0.0.1:11434"
              className="setting-input font-mono"
            />
          </div>

          <div className="setting-field">
            <label>Ollama Server Status</label>
            <div className={`status-pill ${ollamaStatus}`}>
              <Server size={12} />
              <span>{ollamaStatus.toUpperCase()}</span>
            </div>
          </div>

          <div className="setting-field">
            <label>Semgrep Engine</label>
            <div className={`status-pill ${semgrepAvailable ? "connected" : "offline"}`}>
              <Terminal size={12} />
              <span>{semgrepAvailable ? `Active (${semgrepVersion})` : "Not Available"}</span>
            </div>
          </div>
        </div>

        <button
          className="btn-retry full-width"
          onClick={onCheckHealth}
          disabled={isCheckingHealth}
        >
          <RotateCcw size={13} className={isCheckingHealth ? "spin" : ""} />
          <span>{isCheckingHealth ? "Verifying..." : "Refresh Status"}</span>
        </button>
      </div>
    </div>
  );
}
