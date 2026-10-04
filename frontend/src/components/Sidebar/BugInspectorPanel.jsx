import React, { useState } from "react";
import { Bug, AlertTriangle, ShieldCheck, Sparkles, ArrowRight, Play } from "lucide-react";

export default function BugInspectorPanel({ activeFile, code, onAskAI }) {
  const [analyzing, setAnalyzing] = useState(false);

  // Client-side quick static heuristics for beginner guidance
  const heuristics = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.includes("/") && !line.includes("if") && line.includes("len(")) {
      heuristics.push({
        id: `div-zero-${lineNum}`,
        title: "Potential Division by Zero Risk",
        severity: "high",
        line: lineNum,
        description: "Division by `len(...)` without checking if the list is empty can crash with `ZeroDivisionError`.",
        prompt: `In ${activeFile} on line ${lineNum}: How do I fix potential ZeroDivisionError in '${line.trim()}'?`
      });
    }
    if (line.includes("except:") || line.includes("except Exception:")) {
      heuristics.push({
        id: `bare-except-${lineNum}`,
        title: "Broad Exception Handling",
        severity: "medium",
        line: lineNum,
        description: "Catching all exceptions indiscriminately can hide subtle bugs and make debugging harder.",
        prompt: `In ${activeFile} on line ${lineNum}: Explain why '${line.trim()}' is unsafe and show how to catch specific exceptions.`
      });
    }
    if (line.includes("==") && (line.includes("True") || line.includes("False"))) {
      heuristics.push({
        id: `bool-compare-${lineNum}`,
        title: "Redundant Boolean Comparison",
        severity: "low",
        line: lineNum,
        description: "Comparing directly with True or False (e.g. `x == True`) is unidiomatic in Python.",
        prompt: `In ${activeFile} on line ${lineNum}: Clean up the boolean comparison in '${line.trim()}'.`
      });
    }
  });

  return (
    <aside className="bug-inspector-panel">
      <div className="panel-header">
        <span className="panel-title">BUG INSPECTOR</span>
      </div>

      <div className="bug-inspector-body">
        <div className="inspector-card-main">
          <div className="inspector-icon">
            <Bug size={20} />
          </div>
          <div>
            <h3>Code Health Check</h3>
            <p className="muted-text">File: <code>{activeFile}</code></p>
          </div>
        </div>

        <button
          className="scan-btn"
          disabled={analyzing}
          onClick={() => {
            setAnalyzing(true);
            onAskAI("Perform a full bug audit on this code. List all errors, vulnerabilities, and edge cases.");
            setTimeout(() => setAnalyzing(false), 1500);
          }}
        >
          <Sparkles size={14} />
          {analyzing ? "Auditing Code..." : "Run AI Bug Audit"}
        </button>

        <div className="detected-issues">
          <div className="section-title">
            <span>STATIC HEURISTICS ({heuristics.length})</span>
          </div>

          {heuristics.length === 0 ? (
            <div className="clean-state">
              <ShieldCheck size={24} className="clean-icon" />
              <p>No basic heuristic issues detected in this file.</p>
              <small>Run AI Bug Audit for deep logical check.</small>
            </div>
          ) : (
            heuristics.map((issue) => (
              <div key={issue.id} className={`issue-card ${issue.severity}`}>
                <div className="issue-card-header">
                  <span className={`severity-badge ${issue.severity}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="issue-line">Line {issue.line}</span>
                </div>
                <h4 className="issue-title">{issue.title}</h4>
                <p className="issue-desc">{issue.description}</p>
                <button
                  className="fix-suggest-btn"
                  onClick={() => onAskAI(issue.prompt)}
                >
                  <span>Ask AI for Fix</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
