import React, { useState } from "react";
import { Search, FileCode2, ArrowRight } from "lucide-react";

export default function SearchPanel({ files, onSelectFile }) {
  const [searchTerm, setSearchTerm] = useState("");

  const results = [];
  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    Object.entries(files).forEach(([filename, fileObj]) => {
      const lines = fileObj.content.split("\n");
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query)) {
          results.push({
            filename,
            lineNumber: idx + 1,
            lineText: line.trim()
          });
        }
      });
    });
  }

  return (
    <aside className="search-panel">
      <div className="panel-header">
        <span className="panel-title">SEARCH WORKSPACE</span>
      </div>
      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search text in files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results">
        {!searchTerm.trim() ? (
          <div className="empty-state">
            <Search size={28} className="muted-icon" />
            <p>Type keywords to search across all project files.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p>No matches found for "{searchTerm}".</p>
          </div>
        ) : (
          <div className="results-list">
            <div className="results-count">{results.length} result(s) found</div>
            {results.map((res, i) => (
              <div
                key={i}
                className="result-item"
                onClick={() => onSelectFile(res.filename)}
              >
                <div className="result-header">
                  <FileCode2 size={13} />
                  <span>{res.filename}</span>
                  <span className="line-no">Line {res.lineNumber}</span>
                </div>
                <div className="result-line">{res.lineText}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
