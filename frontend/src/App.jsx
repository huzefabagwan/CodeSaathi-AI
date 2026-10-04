import React, { useState, useEffect } from "react";
import {
  Code2,
  Play,
  HelpCircle,
  Folder,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";

import { DEFAULT_FILES } from "./data/defaultWorkspace";
import ActivityBar from "./components/Sidebar/ActivityBar";
import Explorer from "./components/Sidebar/Explorer";
import SearchPanel from "./components/Sidebar/SearchPanel";
import BugInspectorPanel from "./components/Sidebar/BugInspectorPanel";

import EditorTabs from "./components/Editor/EditorTabs";
import MonacoEditorWrapper from "./components/Editor/MonacoEditor";
import StatusBar from "./components/Editor/StatusBar";
import TerminalPanel from "./components/Editor/TerminalPanel";
import DiffPreviewModal from "./components/Editor/DiffPreviewModal";

import AIAssistant from "./components/Assistant/AIAssistant";
import WelcomeModal from "./components/Modals/WelcomeModal";
import HeaderStatusPanel from "./components/Header/HeaderStatusPanel";

export default function App() {
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState("main.py");
  const [openFiles, setOpenFiles] = useState(["main.py", "README.md"]);

  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isMinimapOn, setIsMinimapOn] = useState(true);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Health and Status State
  const [healthData, setHealthData] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 **Welcome to CodeSaathi AI!**\n\nI'm your beginner-friendly local AI coding assistant. I run 100% locally on your machine via Ollama.\n\nChoose an action below or ask me any question about your code!"
    }
  ]);
  const [busy, setBusy] = useState(false);

  const [diffModalData, setDiffModalData] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Poll backend health on startup
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("http://localhost:8000/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      } else {
        setHealthData({
          backend_status: "ok",
          ollama_status: "offline",
          model: "qwen2.5-coder:3b",
          available_models: [],
          message: "Backend response returned an error."
        });
      }
    } catch {
      setHealthData({
        backend_status: "offline",
        ollama_status: "offline",
        model: "qwen2.5-coder:3b",
        available_models: [],
        message: "Could not reach FastAPI backend. Start backend server."
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }

  // File management
  const handleSelectFile = (filename) => {
    setActiveFile(filename);
    if (!openFiles.includes(filename)) {
      setOpenFiles([...openFiles, filename]);
    }
  };

  const handleCloseTab = (filename) => {
    const updated = openFiles.filter((f) => f !== filename);
    setOpenFiles(updated);
    if (activeFile === filename && updated.length > 0) {
      setActiveFile(updated[updated.length - 1]);
    }
  };

  const handleCreateFile = (filename) => {
    let lang = "python";
    if (filename.endsWith(".md")) lang = "markdown";
    if (filename.endsWith(".js") || filename.endsWith(".jsx")) lang = "javascript";

    setFiles((prev) => ({
      ...prev,
      [filename]: {
        name: filename,
        language: lang,
        content: `# New file: ${filename}\n`,
        readOnly: false
      }
    }));
    handleSelectFile(filename);
  };

  const handleDeleteFile = (filename) => {
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[filename];
      return copy;
    });
    handleCloseTab(filename);
  };

  const handleCodeChange = (newCode) => {
    if (!activeFile || !files[activeFile]) return;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: newCode
      }
    }));
  };

  // AI Chat integration (connects to /api/chat)
  async function askAI(questionText) {
    if (!questionText.trim() || busy) return;
    setMessages((prev) => [...prev, { role: "user", content: questionText }]);
    setBusy(true);

    const currentCode = files[activeFile]?.content || "";
    const currentLang = files[activeFile]?.language || "python";

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: questionText,
          code: currentCode,
          filename: activeFile,
          language: currentLang,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          model: healthData?.model
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "AI Request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Local AI Unavailable**\n\n${err.message}`
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  // Code Execution
  async function runCurrentCode() {
    if (!activeFile || !files[activeFile]) return;
    setIsTerminalOpen(true);
    setIsRunningCode(true);

    try {
      const res = await fetch("http://localhost:8000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: files[activeFile].content,
          filename: activeFile
        })
      });
      const data = await res.json();
      setTerminalOutput(data);
    } catch (err) {
      setTerminalOutput({
        stdout: "",
        stderr: `Failed to execute code: ${err.message}`,
        exit_code: 1,
        duration_ms: 0
      });
    } finally {
      setIsRunningCode(false);
    }
  }

  // Diff Modal trigger
  const handleOpenDiffModal = (modifiedCode) => {
    setDiffModalData({
      originalCode: files[activeFile]?.content || "",
      modifiedCode,
      filename: activeFile
    });
  };

  const handleApplyFix = (newCode) => {
    handleCodeChange(newCode);
  };

  const currentFileObj = files[activeFile];
  const currentCode = currentFileObj?.content || "";
  const lineCount = currentCode.split("\n").length;

  const ollamaStatus = healthData?.ollama_status || "offline";
  const modelName = healthData?.model || "qwen2.5-coder:3b";

  // Header status badge renderer
  const renderHeaderStatusIndicator = () => {
    if (isCheckingHealth) {
      return (
        <span className="status-indicator-btn yellow">
          <Loader2 size={12} className="spin" /> Loading model...
        </span>
      );
    }
    if (ollamaStatus === "connected") {
      return (
        <span className="status-indicator-btn green">
          <CheckCircle2 size={12} /> Connected — Local AI ready
        </span>
      );
    }
    if (ollamaStatus === "model_missing") {
      return (
        <span className="status-indicator-btn orange">
          <AlertCircle size={12} /> Model missing ({modelName})
        </span>
      );
    }
    return (
      <span className="status-indicator-btn red">
        <XCircle size={12} /> Offline — Ollama unavailable
      </span>
    );
  };

  return (
    <div className="app-shell">
      {/* Top Header Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <div className="brand-icon">
              <Code2 size={18} />
            </div>
            <span className="brand-name">
              code<span className="brand-accent">saathi</span>
            </span>
            <span className="brand-tag">AI WORKSPACE</span>
          </div>

          <div className="workspace-breadcrumbs">
            <span className="dot" />
            <span>my-project</span>
            <span className="sep">/</span>
            <span className="active-file-tag">{activeFile}</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Header Status Indicator Button */}
          <div
            className="status-trigger-wrap"
            onClick={() => setShowStatusPanel(!showStatusPanel)}
          >
            {renderHeaderStatusIndicator()}
          </div>

          <button
            className="run-code-btn"
            onClick={runCurrentCode}
            disabled={isRunningCode}
            title="Execute Python file"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunningCode ? "Running..." : "Run"}</span>
          </button>

          <button
            className="icon-btn-pill"
            title="Quick Start Guide"
            onClick={() => setShowWelcome(true)}
          >
            <HelpCircle size={15} />
            <span>Guide</span>
          </button>
        </div>

        {/* Status Diagnostic Popover Panel */}
        {showStatusPanel && (
          <HeaderStatusPanel
            healthData={healthData}
            isChecking={isCheckingHealth}
            onRetry={checkHealth}
            onClose={() => setShowStatusPanel(false)}
          />
        )}
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-main">
        {/* Navigation Rail */}
        <ActivityBar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          onOpenWelcome={() => setShowWelcome(true)}
          isExplorerOpen={isExplorerOpen}
          toggleExplorer={() => setIsExplorerOpen(!isExplorerOpen)}
        />

        {/* Left Sidebar Panel */}
        {isExplorerOpen && (
          <div className="sidebar-drawer">
            {activeSidebarTab === "explorer" && (
              <Explorer
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onClose={() => setIsExplorerOpen(false)}
              />
            )}

            {activeSidebarTab === "search" && (
              <SearchPanel files={files} onSelectFile={handleSelectFile} />
            )}

            {activeSidebarTab === "bugs" && (
              <BugInspectorPanel
                activeFile={activeFile}
                code={currentCode}
                onAskAI={askAI}
              />
            )}
          </div>
        )}

        {/* Center Panel — Monaco Editor */}
        <main className="editor-panel">
          <EditorTabs
            openFiles={openFiles}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onCloseTab={handleCloseTab}
            onNewFile={() => handleCreateFile(`untitled_${openFiles.length + 1}.py`)}
            onCopyCode={() => navigator.clipboard?.writeText(currentCode)}
            isMinimapOn={isMinimapOn}
            onToggleMinimap={() => setIsMinimapOn(!isMinimapOn)}
          />

          <div className="editor-body">
            {openFiles.length === 0 ? (
              <div className="empty-editor">
                <Folder size={40} className="empty-icon" />
                <h3>No File Open</h3>
                <p>Select a file from the explorer on the left or create a new file.</p>
                <button
                  className="btn-primary"
                  onClick={() => handleCreateFile("main.py")}
                >
                  Create main.py
                </button>
              </div>
            ) : (
              <MonacoEditorWrapper
                code={currentCode}
                language={currentFileObj?.language || "python"}
                onChange={handleCodeChange}
                minimapEnabled={isMinimapOn}
                readOnly={currentFileObj?.readOnly}
              />
            )}
          </div>

          {/* Terminal Panel */}
          {isTerminalOpen && (
            <TerminalPanel
              output={terminalOutput}
              isRunning={isRunningCode}
              onRun={runCurrentCode}
              onClear={() => setTerminalOutput(null)}
              onClose={() => setIsTerminalOpen(false)}
              onAskAI={askAI}
            />
          )}

          {/* Bottom Status Bar */}
          <StatusBar
            activeFile={activeFile}
            lineCount={lineCount}
            language={currentFileObj?.language || "python"}
            backendOnline={healthData?.backend_status === "ok"}
            ollamaOnline={ollamaStatus === "connected"}
            modelName={modelName}
            notice={ollamaStatus === "connected" ? "Ready" : "Offline"}
            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
            isTerminalOpen={isTerminalOpen}
          />
        </main>

        {/* Right Panel — CodeSaathi AI Assistant */}
        <AIAssistant
          messages={messages}
          busy={busy}
          onSendMessage={askAI}
          activeFile={activeFile}
          onNewChat={() =>
            setMessages([
              {
                role: "assistant",
                content:
                  "New session started! Ask me to explain code, find bugs, or suggest fixes."
              }
            ])
          }
          onOpenDiffModal={handleOpenDiffModal}
          ollamaOnline={ollamaStatus === "connected"}
          modelName={modelName}
          availableModels={healthData?.available_models || []}
          onSelectModel={(m) => setHealthData((prev) => ({ ...prev, model: m }))}
        />
      </div>

      {/* Modals */}
      {diffModalData && (
        <DiffPreviewModal
          originalCode={diffModalData.originalCode}
          modifiedCode={diffModalData.modifiedCode}
          filename={diffModalData.filename}
          onApply={handleApplyFix}
          onClose={() => setDiffModalData(null)}
        />
      )}

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  );
}