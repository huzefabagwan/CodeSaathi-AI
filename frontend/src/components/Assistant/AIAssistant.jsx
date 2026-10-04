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
  Terminal,
  ChevronDown
} from "lucide-react";
import { QUICK_PROMPTS } from "../../data/defaultWorkspace";

export default function AIAssistant({
  messages,
  busy,
  onSendMessage,
  activeFile,
  onNewChat,
  onOpenDiffModal,
  ollamaOnline,
  modelName,
  availableModels = [],
  onSelectModel
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
      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-title">
          <div className="assistant-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>CodeSaathi AI</h3>
            <span className="assistant-sub">Local AI Companion</span>
          </div>
        </div>

        <div className="header-right-actions">
          {availableModels.length > 0 ? (
            <div className="model-selector-wrap">
              <select
                className="model-select-dropdown"
                value={modelName}
                onChange={(e) => onSelectModel(e.target.value)}
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

      {/* Context attachment bar */}
      <div className="context-bar">
        <span className="context-indicator" />
        <span className="context-text">Attached:</span>
        <span className="context-file-chip">
          <FileCode2 size={12} /> {activeFile}
        </span>
      </div>

      {/* Chat messages */}
      <div className="chat-body">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isErrorMsg = msg.content.includes("Could not reach the local AI backend") || msg.content.includes("Model") && msg.content.includes("not found");

          const codeMatches = [...msg.content.matchAll(/```(?:[a-z]*)\n([\s\S]*?)```/g)];
          const hasCodeBlock = codeMatches.length > 0;
          const extractedCode = hasCodeBlock ? codeMatches[codeMatches.length - 1][1] : null;

          if (isErrorMsg) {
            return (
              <div key={index} className="connection-error-card">
                <div className="error-card-header">
                  <AlertCircle size={18} className="text-yellow" />
                  <h4>Ollama Setup Needed</h4>
                </div>
                <p className="error-card-desc">
                  CodeSaathi uses local AI via Ollama. It looks like the model <code>{modelName}</code> is not pulled yet.
                </p>

                <div className="cmd-box">
                  <div className="cmd-title">Run this in your command prompt:</div>
                  <code className="cmd-text">ollama pull {modelName}</code>
                </div>

                <div className="error-card-footer">
                  <small>Once pulled, ask your question again!</small>
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
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>

                    <button
                      className="snippet-btn apply-btn"
                      onClick={() => onOpenDiffModal(extractedCode)}
                    >
                      <Wand2 size={12} />
                      <span>Preview & Apply Fix</span>
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
              <span className="typing-text">CodeSaathi is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="quick-actions-bar">
        <span className="quick-title">TRY ASKING:</span>
        <div className="quick-chips">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              className="quick-chip"
              onClick={() => onSendMessage(qp.prompt)}
              disabled={busy}
            >
              <Sparkles size={11} />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="composer-container">
        <div className="composer-box">
          <textarea
            placeholder="Ask CodeSaathi anything about your code..."
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
              <span className="kbd">Enter</span> to send • <span className="kbd">Shift+Enter</span> for newline
            </span>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!promptText.trim() || busy}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        <div className="privacy-badge">
          <ShieldCheck size={12} />
          <span>Local inference — your code never leaves your machine.</span>
        </div>
      </div>
    </aside>
  );
}
