import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Info,
  XCircle,
  Play,
  RotateCcw,
  Loader2,
  ArrowRight,
  Terminal
} from "lucide-react";

export default function CodeReviewPanel({
  activeFile,
  semgrepResults,
  isScanningSemgrep,
  onRunSemgrep,
  onRunCombinedReview,
  isRunningCombinedReview,
  onAskAIForFix,
  onSelectLine
}) {
  const findings = semgrepResults?.findings || [];
  const status = semgrepResults?.status;

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case "ERROR":
        return <XCircle size={14} className="text-red" />;
      case "WARNING":
        return <AlertTriangle size={14} className="text-yellow" />;
      default:
        return <Info size={14} className="text-blue" />;
    }
  };

  return (
    <div className="sidebar-subpanel">
      <div className="panel-header">
        <span className="panel-title">SEMGREP CODE REVIEW</span>
      </div>

      <div className="panel-scroll-content">
        <div className="inspector-card-main">
          <div className="inspector-icon">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3>Static Analysis & Review</h3>
            <p className="muted-text">File: <code>{activeFile}</code></p>
          </div>
        </div>

        {/* Dual action buttons */}
        <div className="review-action-row">
          <button
            className="btn-review-secondary"
            disabled={isScanningSemgrep || isRunningCombinedReview}
            onClick={onRunSemgrep}
            title="Scan with open-source Semgrep rules without executing code"
          >
            {isScanningSemgrep ? (
              <>
                <Loader2 size={13} className="spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Terminal size={13} />
                <span>Semgrep Scan</span>
              </>
            )}
          </button>

          <button
            className="btn-review-primary"
            disabled={isScanningSemgrep || isRunningCombinedReview}
            onClick={onRunCombinedReview}
            title="Combine Semgrep findings with local Qwen2.5-Coder intelligence"
          >
            {isRunningCombinedReview ? (
              <>
                <Loader2 size={13} className="spin" />
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Full AI Review</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Results Summary */}
        <div className="section-title">
          <span>STATIC FINDINGS ({findings.length})</span>
        </div>

        {status === "unavailable" && (
          <div className="setup-needed-card">
            <AlertTriangle size={16} className="text-yellow" />
            <div>
              <h4>Semgrep Not Detected</h4>
              <p>Install Semgrep in your Python environment for local static analysis:</p>
              <code>pip install semgrep</code>
            </div>
          </div>
        )}

        {status !== "unavailable" && findings.length === 0 && !isScanningSemgrep && (
          <div className="clean-state">
            <ShieldCheck size={28} className="clean-icon text-emerald" />
            <p>No static analysis issues detected in this file.</p>
            <small>Run "Semgrep Scan" or "Full AI Review" to inspect.</small>
          </div>
        )}

        <div className="findings-list">
          {findings.map((item, idx) => (
            <div
              key={idx}
              className={`issue-card ${item.severity?.toLowerCase()}`}
              onClick={() => onSelectLine && onSelectLine(item.line)}
            >
              <div className="issue-card-header">
                <span className={`severity-badge ${item.severity?.toLowerCase()}`}>
                  {getSeverityIcon(item.severity)}
                  <span>{item.severity}</span>
                </span>
                <span className="issue-line">Line {item.line}</span>
              </div>

              <div className="issue-rule font-mono">{item.rule_id}</div>
              <p className="issue-desc">{item.message}</p>

              {item.code && (
                <div className="code-snippet-preview">
                  <code>{item.code}</code>
                </div>
              )}

              <button
                className="fix-suggest-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAIForFix(
                    `Semgrep reported ${item.severity} rule '${item.rule_id}' on line ${item.line}:\n` +
                    `"${item.message}"\n` +
                    `Code snippet:\n\`\`\`\n${item.code || ""}\n\`\`\`\n` +
                    `Explain why this matters and provide the complete corrected code.`
                  );
                }}
              >
                <span>Ask AI to Fix</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="layer-architecture-box">
          <h5>Analysis Pipeline</h5>
          <div className="pipeline-steps">
            <div className="pipeline-step">
              <span className="step-num">1</span>
              <span>Semgrep AST Scan (Local)</span>
            </div>
            <div className="pipeline-arrow">↓</div>
            <div className="pipeline-step">
              <span className="step-num">2</span>
              <span>Qwen2.5-Coder:7b Context Fusion</span>
            </div>
            <div className="pipeline-arrow">↓</div>
            <div className="pipeline-step">
              <span className="step-num">3</span>
              <span>Unified Code Review & Solution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
