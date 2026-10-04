import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function MonacoEditorWrapper({
  code,
  language = "python",
  onChange,
  minimapEnabled = true,
  readOnly = false
}) {
  const [editorFailed, setEditorFailed] = useState(false);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("codesaathi-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A737D", fontStyle: "italic" },
        { token: "keyword", foreground: "34D399", fontStyle: "bold" },
        { token: "string", foreground: "FCD34D" },
        { token: "number", foreground: "60A5FA" },
        { token: "function", foreground: "A78BFA" }
      ],
      colors: {
        "editor.background": "#0F172A",
        "editor.foreground": "#E2E8F0",
        "editorCursor.foreground": "#34D399",
        "editor.lineHighlightBackground": "#1E293B60",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#34D399",
        "editor.selectionBackground": "#334155"
      }
    });
  };

  if (editorFailed) {
    return (
      <div className="fallback-editor">
        <div className="line-numbers">
          {code.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          spellCheck="false"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
        />
      </div>
    );
  }

  return (
    <div className="monaco-container">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="codesaathi-dark"
        onChange={(val) => onChange(val || "")}
        beforeMount={handleEditorWillMount}
        onMount={() => {}}
        onError={() => setEditorFailed(true)}
        options={{
          readOnly,
          minimap: { enabled: minimapEnabled },
          fontSize: 13,
          fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace",
          lineNumbers: "on",
          lineHeight: 22,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "all",
          tabSize: 4
        }}
      />
    </div>
  );
}
