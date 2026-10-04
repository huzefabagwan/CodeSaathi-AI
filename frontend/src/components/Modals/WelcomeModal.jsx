import React from "react";
import { Sparkles, Code2, Play, Bug, ShieldCheck, X, ArrowRight, CheckCircle2 } from "lucide-react";

export default function WelcomeModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="brand-logo">
            <Code2 size={24} className="logo-icon" />
            <h2>Welcome to CodeSaathi AI</h2>
          </div>
          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="welcome-subtitle">
          Your local-first, beginner-friendly AI coding workspace. Learn, debug, and build faster with local AI models.
        </p>

        <div className="feature-grid">
          <div className="feature-box">
            <div className="feature-icon text-emerald">
              <Code2 size={20} />
            </div>
            <h4>VS Code-Inspired Editor</h4>
            <p>Monaco editor with full syntax highlighting, tabs, minimap, and multi-file project explorer.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon text-teal">
              <Sparkles size={20} />
            </div>
            <h4>Private Local AI Companion</h4>
            <p>Runs 100% locally on Ollama. Explain code, generate unit tests, and fix bugs privately.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon text-yellow">
              <Play size={20} />
            </div>
            <h4>Live Python Runner</h4>
            <p>Run your Python scripts instantly in the built-in terminal and inspect output and errors.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon text-red">
              <Bug size={20} />
            </div>
            <h4>Visual Fix Preview</h4>
            <p>Inspect AI bug fixes side-by-side with diff view before applying changes to your files.</p>
          </div>
        </div>

        <div className="quickstart-steps">
          <h3>🚀 Quick Start Guide</h3>
          <ul>
            <li>
              <CheckCircle2 size={15} className="step-icon" />
              <span>Select <code>main.py</code> in the Explorer panel on the left.</span>
            </li>
            <li>
              <CheckCircle2 size={15} className="step-icon" />
              <span>Click <strong>"▶ Run"</strong> in the top editor bar to execute the Python script.</span>
            </li>
            <li>
              <CheckCircle2 size={15} className="step-icon" />
              <span>Click <strong>"Find bugs"</strong> in the AI panel on the right to analyze code.</span>
            </li>
          </ul>
        </div>

        <div className="welcome-footer">
          <div className="privacy-info">
            <ShieldCheck size={14} />
            <span>No data leaves your device.</span>
          </div>
          <button className="btn-primary" onClick={onClose}>
            <span>Open Workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
