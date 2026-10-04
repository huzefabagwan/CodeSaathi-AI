import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  MoreHorizontal,
  FilePlus,
  Search,
  X
} from "lucide-react";

export default function Explorer({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onClose
}) {
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName("");
    setIsCreating(false);
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith(".py")) {
      return <FileCode2 size={15} className="icon-python" />;
    }
    if (filename.endsWith(".md")) {
      return <FileText size={15} className="icon-markdown" />;
    }
    if (filename.endsWith(".js") || filename.endsWith(".jsx")) {
      return <FileCode2 size={15} className="icon-javascript" />;
    }
    return <FileText size={15} className="icon-generic" />;
  };

  const fileList = Object.keys(files).filter((name) =>
    name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <aside className="explorer-panel">
      <div className="panel-header">
        <span className="panel-title">EXPLORER</span>
        <div className="header-actions">
          <button
            className="icon-action"
            title="New File"
            onClick={() => setIsCreating(true)}
          >
            <FilePlus size={15} />
          </button>
          <button className="icon-action" title="Collapse" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="explorer-search">
        <Search size={13} className="search-icon" />
        <input
          type="text"
          placeholder="Filter files..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        {filterText && (
          <button className="clear-search" onClick={() => setFilterText("")}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className="explorer-content">
        <div
          className="folder-tree-header"
          onClick={() => setIsFolderOpen(!isFolderOpen)}
        >
          {isFolderOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {isFolderOpen ? (
            <FolderOpen size={15} className="folder-icon" />
          ) : (
            <Folder size={15} className="folder-icon" />
          )}
          <span className="project-name">codesaathi-workspace</span>
        </div>

        {isFolderOpen && (
          <div className="file-tree">
            {isCreating && (
              <form className="new-file-form" onSubmit={handleCreateSubmit}>
                <FileCode2 size={14} className="icon-new" />
                <input
                  type="text"
                  autoFocus
                  placeholder="filename.py"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => {
                    if (!newFileName.trim()) setIsCreating(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                />
              </form>
            )}

            {fileList.map((filename) => {
              const isSelected = activeFile === filename;
              return (
                <div
                  key={filename}
                  className={`file-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectFile(filename)}
                >
                  <div className="file-item-left">
                    {getFileIcon(filename)}
                    <span className="file-name">{filename}</span>
                  </div>

                  {Object.keys(files).length > 1 && (
                    <button
                      className="file-delete-btn"
                      title="Delete File"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${filename}?`)) {
                          onDeleteFile(filename);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="explorer-footer">
        <div className="info-chip">
          <span className="chip-dot" /> {fileList.length} files in workspace
        </div>
      </div>
    </aside>
  );
}
