import React from "react";
import { Folder, Search, MessageSquare, Bug, Settings, HelpCircle, History } from "lucide-react";

export default function ActivityBar({ activeTab, setActiveTab, onOpenWelcome, isExplorerOpen, toggleExplorer }) {
  return (
    <aside className="activity-bar">
      <div className="activity-top">
        <button
          className={`activity-btn ${activeTab === "explorer" && isExplorerOpen ? "active" : ""}`}
          onClick={() => {
            if (activeTab === "explorer") {
              toggleExplorer();
            } else {
              setActiveTab("explorer");
              if (!isExplorerOpen) toggleExplorer();
            }
          }}
          title="File Explorer (Ctrl+Shift+E)"
        >
          <Folder size={19} />
          <span className="activity-tooltip">Explorer</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "search" && isExplorerOpen ? "active" : ""}`}
          onClick={() => {
            setActiveTab("search");
            if (!isExplorerOpen) toggleExplorer();
          }}
          title="Search Workspace (Ctrl+Shift+F)"
        >
          <Search size={19} />
          <span className="activity-tooltip">Search</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "assistant" ? "active" : ""}`}
          onClick={() => setActiveTab("assistant")}
          title="AI Assistant (Ctrl+Shift+A)"
        >
          <MessageSquare size={19} />
          <span className="activity-tooltip">AI Assistant</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "bugs" && isExplorerOpen ? "active" : ""}`}
          onClick={() => {
            setActiveTab("bugs");
            if (!isExplorerOpen) toggleExplorer();
          }}
          title="Bug Inspector"
        >
          <Bug size={19} />
          <span className="activity-tooltip">Bug Inspector</span>
        </button>
      </div>

      <div className="activity-bottom">
        <button
          className="activity-btn"
          onClick={onOpenWelcome}
          title="Welcome & Quick Start Guide"
        >
          <HelpCircle size={19} />
          <span className="activity-tooltip">Quick Guide</span>
        </button>

        <button
          className={`activity-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
          title="Settings"
        >
          <Settings size={19} />
          <span className="activity-tooltip">Settings</span>
        </button>
      </div>
    </aside>
  );
}
