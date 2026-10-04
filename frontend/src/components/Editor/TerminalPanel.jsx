import React from "react";
import { Terminal, X, Play, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function TerminalPanel({
  output,
  isRunning,
  onRun,
  onClear,
  onClose,
  onAskAI
}) {
  const hasError = output && (output.exit_code !== 0 || output.stderr);

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button className="tab-btn active">
            <Terminal size={13} /> Output Terminal
          </button>
        </div>

        <div className="terminal-actions">
          {output && output.duration_ms && (
            <span className="timing-chip">
              <Clock size={11} /> {output.duration_ms} ms
            </span>
          )}

          <button
            className="action-btn"
            title="Re-run Code"
            onClick={onRun}
            disabled={isRunning}
          >
            <RotateCcw size={13} />
          </button>

          <button className="action-btn" title="Clear Output" onClick={onClear}>
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="terminal-content">
        {isRunning ? (
          <div className="terminal-running">
            <span className="spinner" />
            <span>Executing Python script in local environment...</span>
          </div>
        ) : !output ? (
          <div className="terminal-empty">
            <p>
              Click <strong>"▶ Run"</strong> in the top toolbar to execute Python code.
            </p>
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
                      `I got this error while running my code:\n\`\`\`\n${output.stderr}\n\`\`\`\nExplain what went wrong and give me the fixed code.`
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
                <CheckCircle2 size={13} /> Process finished with exit code 0
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
