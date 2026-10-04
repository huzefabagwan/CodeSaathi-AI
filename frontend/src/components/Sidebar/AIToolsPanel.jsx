import React from "react";
import {
  HelpCircle,
  Bug,
  Search,
  Wrench,
  Zap,
  CheckSquare,
  ShieldAlert,
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { AI_ACTIONS } from "../../data/defaultWorkspace";

const ICON_MAP = {
  HelpCircle,
  Bug,
  Search,
  Wrench,
  Zap,
  CheckSquare,
  ShieldAlert,
  Activity
};

export default function AIToolsPanel({ activeFile, onRunAction, isAnalyzing }) {
  return (
    <div className="sidebar-subpanel">
      <div className="panel-header">
        <span className="panel-title">AI TOOLS & ACTIONS</span>
      </div>

      <div className="panel-scroll-content">
        <div className="inspector-card-main">
          <div className="inspector-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>Local AI Actions</h3>
            <p className="muted-text">File: <code>{activeFile}</code></p>
          </div>
        </div>

        <div className="tools-grid">
          {AI_ACTIONS.map((action) => {
            const IconComponent = ICON_MAP[action.icon] || Sparkles;
            return (
              <button
                key={action.id}
                className="tool-action-card"
                disabled={isAnalyzing}
                onClick={() => onRunAction(action.id)}
              >
                <div className="tool-card-icon">
                  <IconComponent size={16} />
                </div>
                <div className="tool-card-text">
                  <span className="tool-card-title">{action.label}</span>
                  <span className="tool-card-desc">{action.description}</span>
                </div>
                <ArrowRight size={13} className="tool-card-arrow" />
              </button>
            );
          })}
        </div>

        <div className="privacy-callout-box">
          <span className="privacy-badge-pill">🔒 Offline AI</span>
          <p>
            Prompts and source code are processed 100% locally by Qwen2.5-Coder:7b. No cloud transfer occurs.
          </p>
        </div>
      </div>
    </div>
  );
}
