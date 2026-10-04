import React, { useState } from "react";
import {
  Terminal,
  ShieldAlert,
  Activity,
  X,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  XCircle,
  Wand2
} from "lucide-react";

export default function TerminalPanel({
  output,
  isRunning,
  onRun,
  onClear,
  onClose,
  onAskAI,
  semgrepFindings = [],
  analysisResult = null,
  activeTab = "output",
  onTabChange,
  onOpenDiffModal
}) {
  const [tab, setTab] = useState(activeTab);

  const currentTab = onTabChange ? activeTab : tab;
  const setTabState = (t) => {
    setTab(t);
    if (onTabChange) onTabChange(t);
  };

  const getSeverityIcon = (sev) => {
    switch (sev?.toUpperCase()) {
      case "ERROR":
        return <XCircle size={13} className="text-red" />;
      case "WARNING":
        return <AlertTriangle size={13} className="text-yellow" />;
      default:
        return <Info size={13} className="text-blue" />;
    }
  };

  return (
    <div className="terminal-panel">
      {/* Tab bar header */}
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button
            className={`tab-btn ${currentTab === "problems" ? "active" : ""}`}
            onClick={() => setTabState("problems")}
          >
            <ShieldAlert size={13} />
            <span>Problems</span>
            {semgrepFindings.length > 0 && (
              <span className="tab-badge">{semgrepFindings.length}</span>
            )}
          </button>

          <button
            className={`tab-btn ${currentTab === "output" ? "active" : ""}`}
            onClick={() => setTabState("output")}
          >
            <Terminal size={13} />
            <span>Output</span>
          </button>

          <button
            className={`tab-btn ${currentTab === "analysis" ? "active" : ""}`}
            onClick={() => setTabState("analysis")}
          >
            <Activity size={13} />
            <span>Analysis</span>
            {analysisResult && <span className="tab-dot" />}
          </button>
        </div>

        <div className="terminal-actions">
          {currentTab === "output" && output && output.duration_ms !== undefined && (
            <span className="timing-chip">
              <Clock size={11} /> {output.duration_ms} ms
            </span>
          )}

          {currentTab === "output" && (
            <button
              className="action-btn"
              title="Re-run Python Code"
              onClick={onRun}
              disabled={isRunning}
            >
              <RotateCcw size={13} />
            </button>
          )}

          <button className="action-btn" title="Clear Output" onClick={onClear}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      <div className="terminal-content">
        {currentTab === "output" && (
          <div className="output-tab-pane">
            {isRunning ? (
              <div className="terminal-running">
                <span className="spinner" />
                <span>Executing Python script in local isolated runtime...</span>
              </div>
            ) : !output ? (
              <div className="terminal-empty">
                <p>
                  Click <strong>"▶ Run"</strong> in the top toolbar to execute the active Python file.
                </p>
                <small>Execution is evaluated locally with a 10s timeout.</small>
              </div>
            ) : (
              <div className="terminal-output-wrap">
                {output.stdout && (
                  <pre className="output-stdout">
                    <code>{output.stdout}</code>
                  </pre>
                )}

                {output.stderr && (
                  <div className="output-stderr-box">
                    <div className="stderr-title">
                      <AlertTriangle size={14} /> Execution Error (Exit Code {output.exit_code})
                    </div>
                    <pre className="output-stderr">
                      <code>{output.stderr}</code>
                    </pre>

                    <button
                      className="ai-fix-error-btn"
                      onClick={() =>
                        onAskAI(
                          `I encountered this error when running my code:\n\`\`\`\n${output.stderr}\n\`\`\`\nExplain the cause and provide the complete corrected code.`
                        )
                      }
                    >
                      <Sparkles size={14} />
                      <span>Ask CodeSaathi AI to Fix Error</span>
                    </button>
                  </div>
                )}

                {!output.stderr && output.stdout && (
                  <div className="output-success-msg">
                    <CheckCircle2 size={13} /> Process finished successfully (exit code 0)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentTab === "problems" && (
          <div className="problems-tab-pane">
            {semgrepFindings.length === 0 ? (
              <div className="terminal-empty">
                <CheckCircle2 size={24} className="text-emerald" />
                <p>No static analysis issues detected.</p>
                <small>Run "Semgrep Scan" or "Security Review" to inspect your code.</small>
              </div>
            ) : (
              <div className="problems-table">
                {semgrepFindings.map((finding, idx) => (
                  <div key={idx} className="problem-row">
                    <div className="problem-severity">
                      {getSeverityIcon(finding.severity)}
                      <span className={`severity-text ${finding.severity?.toLowerCase()}`}>
                        {finding.severity}
                      </span>
                    </div>
                    <div className="problem-location font-mono">
                      {finding.path}:{finding.line}
                    </div>
                    <div className="problem-rule font-mono">{finding.rule_id}</div>
                    <div className="problem-desc">{finding.message}</div>
                    <button
                      className="problem-fix-btn"
                      onClick={() =>
                        onAskAI(
                          `In ${finding.path} on line ${finding.line}, Semgrep reported ${finding.severity} for rule '${finding.rule_id}':\n` +
                          `"${finding.message}"\n` +
                          `Code snippet:\n\`\`\`\n${finding.code || ""}\n\`\`\`\n` +
                          `Please explain why this matters and provide the complete corrected code.`
                        )
                      }
                    >
                      <Sparkles size={11} />
                      <span>Fix</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "analysis" && (
          <div className="analysis-tab-pane">
            {!analysisResult ? (
              <div className="terminal-empty">
                <Activity size={24} className="text-blue" />
                <p>No AI analysis performed yet.</p>
                <small>Click any action like "Debug", "Security", or "Complexity" to view structured results.</small>
              </div>
            ) : (
              <div className="analysis-structured-view">
                <div className="analysis-header-row">
                  <span className="analysis-action-tag font-mono">
                    {analysisResult.action?.toUpperCase()}
                  </span>
                  <span className="analysis-model-tag font-mono">
                    {analysisResult.model || "qwen2.5-coder:7b"} (local)
                  </span>
                  {analysisResult.complexity && (
                    <span className="analysis-complexity-tag">
                      {analysisResult.complexity}
                    </span>
                  )}
                </div>

                <div className="analysis-summary-box">
                  <h4>Summary</h4>
                  <p>{analysisResult.summary}</p>
                </div>

                {analysisResult.issues && analysisResult.issues.length > 0 && (
                  <div className="analysis-issues-box">
                    <h4>Issues Identified ({analysisResult.issues.length})</h4>
                    <ul className="issues-list">
                      {analysisResult.issues.map((iss, i) => (
                        <li key={i} className="issue-item">
                          <span className={`severity-badge-mini ${iss.severity?.toLowerCase()}`}>
                            {iss.severity || "INFO"}
                          </span>
                          {iss.line && <span className="line-num font-mono">Line {iss.line}:</span>}
                          <span>{iss.description || iss.message || JSON.stringify(iss)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                  <div className="analysis-suggestions-box">
                    <h4>Recommendations</h4>
                    <ul className="suggestions-list">
                      {analysisResult.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.fixed_code && (
                  <div className="analysis-code-box">
                    <div className="code-box-header">
                      <h4>Suggested Solution</h4>
                      <button
                        className="btn-apply-mini"
                        onClick={() => onOpenDiffModal && onOpenDiffModal(analysisResult.fixed_code)}
                      >
                        <Wand2 size={12} />
                        <span>Preview & Apply Fix</span>
                      </button>
                    </div>
                    <pre className="code-pre">
                      <code>{analysisResult.fixed_code}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
