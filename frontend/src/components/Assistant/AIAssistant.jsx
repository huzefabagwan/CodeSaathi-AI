import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Bot,
  User,
  Plus,
  Send,
  ShieldCheck,
  FileCode2,
  Copy,
  Check,
  Wand2,
  AlertCircle,
  HelpCircle,
  Bug,
  Zap,
  Wrench,
  ShieldAlert,
  Activity,
  CheckSquare,
  Loader2,
  ChevronDown,
  Terminal
} from "lucide-react";
import { AI_ACTIONS } from "../../data/defaultWorkspace";

export default function AIAssistant({
  messages,
  busy,
  onSendMessage,
  onRunAction,
  activeFile,
  onNewChat,
  onOpenDiffModal,
  ollamaOnline,
  modelName,
  availableModels = [],
  onSelectModel,
  onRunSemgrep,
  onRunCombinedReview,
  isRunningCombinedReview
}) {
  const [promptText, setPromptText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSend = () => {
    if (!promptText.trim() || busy) return;
    onSendMessage(promptText);
    setPromptText("");
  };

  const copySnippet = (text, index) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <aside className="assistant-panel">
      {/* Top Assistant Header */}
      <div className="assistant-header">
        <div className="assistant-title">
          <div className="assistant-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>AI Assistant</h3>
            <span className="assistant-sub">
              {ollamaOnline ? "🟢 Local AI Active" : "⚠️ Offline"}
            </span>
          </div>
        </div>

        <div className="header-right-actions">
          {availableModels.length > 0 ? (
            <div className="model-selector-wrap">
              <select
                className="model-select-dropdown"
                value={modelName}
                onChange={(e) => onSelectModel && onSelectModel(e.target.value)}
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="select-arrow" />
            </div>
          ) : (
            <span className="model-chip offline" title="Ollama offline or model missing">
              <AlertCircle size={10} /> {modelName}
            </span>
          )}

          <button
            className="icon-action"
            title="Start New Chat"
            onClick={onNewChat}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Active Context Bar */}
      <div className="context-bar">
        <span className="context-indicator" />
        <span className="context-text">Context:</span>
        <span className="context-file-chip">
          <FileCode2 size={12} /> {activeFile}
        </span>

        <button
          className="context-review-btn"
          onClick={onRunCombinedReview}
          disabled={busy || isRunningCombinedReview}
          title="Run Semgrep + AI Combined Review"
        >
          {isRunningCombinedReview ? (
            <Loader2 size={11} className="spin" />
          ) : (
            <ShieldAlert size={11} />
          )}
          <span>Full Review</span>
        </button>
      </div>

      {/* Quick AI Action Pills Bar */}
      <div className="action-pills-bar">
        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("explain")}
          title="Explain active code"
        >
          <HelpCircle size={11} />
          <span>Explain</span>
        </button>

        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("debug")}
          title="Debug logic & errors"
        >
          <Bug size={11} />
          <span>Debug</span>
        </button>

        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("optimize")}
          title="Optimize performance"
        >
          <Zap size={11} />
          <span>Optimize</span>
        </button>

        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("fix_errors")}
          title="Fix syntax & errors"
        >
          <Wrench size={11} />
          <span>Fix</span>
        </button>

        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("security_review")}
          title="Security audit"
        >
          <ShieldAlert size={11} />
          <span>Security</span>
        </button>

        <button
          className="action-pill"
          disabled={busy}
          onClick={() => onRunAction && onRunAction("generate_tests")}
          title="Generate test cases"
        >
          <CheckSquare size={11} />
          <span>Tests</span>
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="chat-body">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isErrorMsg =
            msg.content.includes("Could not reach the local AI backend") ||
            (msg.content.includes("Model") && msg.content.includes("not found"));

          const codeMatches = [...msg.content.matchAll(/```(?:[a-z0-9_-]*)\n([\s\S]*?)```/gi)];
          const hasCodeBlock = codeMatches.length > 0;
          const extractedCode = hasCodeBlock ? codeMatches[codeMatches.length - 1][1] : null;

          if (isErrorMsg) {
            return (
              <div key={index} className="connection-error-card">
                <div className="error-card-header">
                  <AlertCircle size={18} className="text-yellow" />
                  <h4>Ollama Setup Required</h4>
                </div>
                <p className="error-card-desc">
                  CodeSaathi AI uses local inference via Ollama. Model <code>{modelName}</code> is currently missing or downloading.
                </p>
                <div className="cmd-box">
                  <div className="cmd-title">Run in your terminal:</div>
                  <code className="cmd-text">ollama pull {modelName}</code>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className={`message-bubble-wrap ${msg.role}`}>
              <div className="message-avatar">
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className="message-bubble">
                <div className="message-text">
                  {isUser ? (
                    <p>{msg.content}</p>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>

                {!isUser && extractedCode && (
                  <div className="snippet-actions">
                    <button
                      className="snippet-btn"
                      onClick={() => copySnippet(extractedCode, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={12} className="text-emerald" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    <button
                      className="snippet-btn apply-btn"
                      onClick={() => onOpenDiffModal && onOpenDiffModal(extractedCode)}
                    >
                      <Wand2 size={12} />
                      <span>Preview & Apply</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="message-bubble-wrap assistant">
            <div className="message-avatar">
              <Bot size={14} />
            </div>
            <div className="message-bubble typing-state">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-text">Qwen2.5-Coder:7b is generating locally...</span>
            </div>
          </div>
        )}
      </div>

      {/* Composer Area */}
      <div className="composer-container">
        <div className="composer-box">
          <textarea
            placeholder={`Ask about ${activeFile} or request code refactoring...`}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
          />
          <div className="composer-toolbar">
            <span className="hint-text">
              <span className="kbd">Enter</span> send • <span className="kbd">Shift+Enter</span> newline
            </span>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!promptText.trim() || busy}
              title="Send Prompt (Enter)"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Privacy Note Badge */}
        <div className="privacy-badge">
          <ShieldCheck size={12} />
          <span>Local inference — your code never leaves your device.</span>
        </div>
      </div>
    </aside>
  );
}
