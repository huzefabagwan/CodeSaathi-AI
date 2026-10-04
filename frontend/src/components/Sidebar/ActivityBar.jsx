import React from "react";
import { Folder, Sparkles, ShieldAlert, History, Settings, HelpCircle, ShieldCheck } from "lucide-react";

export default function ActivityBar({
  activeTab,
  setActiveTab,
  onOpenWelcome,
  isSidebarOpen,
  toggleSidebar,
  semgrepFindingCount = 0
}) {
  const handleTabClick = (tab) => {
    if (activeTab === tab && isSidebarOpen) {
      toggleSidebar();
    } else {
      setActiveTab(tab);
      if (!isSidebarOpen) toggleSidebar();
    }
  };

  return (
    <aside className="activity-bar">
      <div className="activity-top">
        <button
          className={`activity-btn ${activeTab === "files" && isSidebarOpen ? "active" : ""}`}
          onClick={() => handleTabClick("files")}
          title="Files (Explorer)"
        >
          <Folder size={19} />
          <span className="activity-tooltip">Files</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "tools" && isSidebarOpen ? "active" : ""}`}
          onClick={() => handleTabClick("tools")}
          title="AI Tools & Actions"
        >
          <Sparkles size={19} />
          <span className="activity-tooltip">AI Tools</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "review" && isSidebarOpen ? "active" : ""}`}
          onClick={() => handleTabClick("review")}
          title="Code Review & Semgrep Static Analysis"
        >
          <ShieldAlert size={19} />
          {semgrepFindingCount > 0 && (
            <span className="activity-badge">{semgrepFindingCount}</span>
          )}
          <span className="activity-tooltip">Code Review</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "history" && isSidebarOpen ? "active" : ""}`}
          onClick={() => handleTabClick("history")}
          title="Prompt & Chat History"
        >
          <History size={19} />
          <span className="activity-tooltip">History</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "settings" && isSidebarOpen ? "active" : ""}`}
          onClick={() => handleTabClick("settings")}
          title="Settings & Privacy Diagnostics"
        >
          <Settings size={19} />
          <span className="activity-tooltip">Settings</span>
        </button>
      </div>

      <div className="activity-bottom">
        <div className="privacy-sidebar-indicator" title="Privacy First: 100% Local Inference">
          <ShieldCheck size={18} className="text-emerald" />
        </div>

        <button
          className="activity-btn"
          onClick={onOpenWelcome}
          title="Quick Start & Architecture Guide"
        >
          <HelpCircle size={19} />
          <span className="activity-tooltip">Guide</span>
        </button>
      </div>
    </aside>
  );
}
