import React from "react";
import { History, MessageSquare, Trash2, ArrowRight } from "lucide-react";

export default function HistoryPanel({ messages = [], onSelectMessage, onClearHistory }) {
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div className="sidebar-subpanel">
      <div className="panel-header">
        <span className="panel-title">CONVERSATION HISTORY</span>
        {userMessages.length > 0 && (
          <button
            className="icon-action-mini"
            onClick={onClearHistory}
            title="Clear History"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="panel-scroll-content">
        {userMessages.length === 0 ? (
          <div className="clean-state">
            <History size={26} className="clean-icon" />
            <p>No prompt history yet.</p>
            <small>Ask questions or run AI actions to view recent requests.</small>
          </div>
        ) : (
          <div className="history-list">
            {userMessages.map((msg, index) => (
              <div
                key={index}
                className="history-item-card"
                onClick={() => onSelectMessage && onSelectMessage(msg.content)}
              >
                <div className="history-item-header">
                  <MessageSquare size={13} className="text-emerald" />
                  <span className="history-item-tag">Prompt #{index + 1}</span>
                </div>
                <p className="history-item-text">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
