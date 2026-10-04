import React from "react";
import { FileCode2, FileText, X, Plus, Copy, Check, Eye } from "lucide-react";

export default function EditorTabs({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseTab,
  onNewFile,
  onCopyCode,
  isMinimapOn,
  onToggleMinimap
}) {
  const [copied, setCopied] = React.useState(false);

  const getTabIcon = (filename) => {
    if (filename.endsWith(".py")) return <FileCode2 size={14} className="icon-python" />;
    if (filename.endsWith(".md")) return <FileText size={14} className="icon-markdown" />;
    return <FileCode2 size={14} className="icon-generic" />;
  };

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editor-tabbar">
      <div className="tab-list">
        {openFiles.map((filename) => {
          const isActive = filename === activeFile;
          return (
            <div
              key={filename}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectFile(filename)}
            >
              {getTabIcon(filename)}
              <span className="tab-label">{filename}</span>
              <button
                className="tab-close-btn"
                title="Close Tab"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(filename);
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        <button
          className="tab-new-btn"
          title="New File"
          onClick={onNewFile}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="tabbar-actions">
        <button
          className={`action-pill ${isMinimapOn ? "active" : ""}`}
          title="Toggle Minimap"
          onClick={onToggleMinimap}
        >
          <Eye size={13} />
          <span>Minimap</span>
        </button>

        <button
          className="action-pill"
          title="Copy Code"
          onClick={handleCopy}
        >
          {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
