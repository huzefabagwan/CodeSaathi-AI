import React from "react";
import { DiffEditor } from "@monaco-editor/react";
import { Check, X, Sparkles, FileCode2 } from "lucide-react";

export default function DiffPreviewModal({
  originalCode,
  modifiedCode,
  filename,
  onApply,
  onClose
}) {
  return (
    <div className="modal-backdrop">
      <div className="diff-modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} className="text-emerald" />
            <div>
              <h3>AI Suggested Code Fix</h3>
              <p className="muted-text">File: <code>{filename}</code></p>
            </div>
          </div>
          <button className="icon-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="diff-modal-body">
          <div className="diff-banner">
            <span className="diff-label original">Current Code (Original)</span>
            <span className="diff-label modified">Proposed Fix (AI Suggested)</span>
          </div>

          <div className="diff-editor-container">
            <DiffEditor
              height="380px"
              language="python"
              original={originalCode}
              modified={modifiedCode}
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'DM Mono', monospace",
                automaticLayout: true
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Discard / Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onApply(modifiedCode);
              onClose();
            }}
          >
            <Check size={16} />
            <span>Apply Fix to File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
