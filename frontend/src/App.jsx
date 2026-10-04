import React, { useState, useEffect } from "react";
import {
  Code2,
  Play,
  HelpCircle,
  Folder,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Sparkles,
  Terminal,
  Activity,
  Zap,
  Wand2
} from "lucide-react";

import api from "./api/client";
import { DEFAULT_FILES, AI_ACTIONS } from "./data/defaultWorkspace";
import ActivityBar from "./components/Sidebar/ActivityBar";
import Explorer from "./components/Sidebar/Explorer";
import AIToolsPanel from "./components/Sidebar/AIToolsPanel";
import CodeReviewPanel from "./components/Sidebar/CodeReviewPanel";
import HistoryPanel from "./components/Sidebar/HistoryPanel";
import SettingsPanel from "./components/Sidebar/SettingsPanel";

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
  const [openFiles, setOpenFiles] = useState(["main.py", "security_demo.py", "README.md"]);

  const [activeSidebarTab, setActiveSidebarTab] = useState("files");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMinimapOn, setIsMinimapOn] = useState(true);

  // Bottom Panel state
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState("output");
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Semgrep Static Analysis state
  const [semgrepResults, setSemgrepResults] = useState(null);
  const [isScanningSemgrep, setIsScanningSemgrep] = useState(false);

  // AI Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningCombinedReview, setIsRunningCombinedReview] = useState(false);

  // Toast notification state
  const [toast, setToToast] = useState(null);

  // Health and Status State
  const [healthData, setHealthData] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 **Welcome to CodeSaathi AI!**\n\nI run 100% locally on your machine via **Ollama + Qwen2.5-Coder:7b** with local **Semgrep** static analysis.\n\nYour code and prompts stay strictly on this device.\n\nTry clicking **Debug**, **Security Review**, or **Full Review** to analyze the active file!"
    }
  ]);
  const [busy, setBusy] = useState(false);

  const [diffModalData, setDiffModalData] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const showToast = (message, type = "info") => {
    setToToast({ message, type });
    setTimeout(() => setToToast(null), 3500);
  };

  // Poll backend health on startup
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    setIsCheckingHealth(true);
    try {
      const data = await api.checkHealth();
      setHealthData(data);
    } catch (err) {
      setHealthData({
        backend_status: "offline",
        ollama_status: "offline",
        model: "qwen2.5-coder:7b",
        model_available: false,
        available_models: [],
        local_ai_active: false,
        semgrep_available: false,
        privacy_mode: "100% Local Inference",
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
    if (filename.endsWith(".json")) lang = "json";

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
    showToast(`Created file ${filename}`, "success");
  };

  const handleDeleteFile = (filename) => {
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[filename];
      return copy;
    });
    handleCloseTab(filename);
    showToast(`Deleted ${filename}`, "info");
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

  // AI Chat integration
  async function askAI(questionText) {
    if (!questionText.trim() || busy) return;
    setMessages((prev) => [...prev, { role: "user", content: questionText }]);
    setBusy(true);

    const currentCode = files[activeFile]?.content || "";
    const currentLang = files[activeFile]?.language || "python";

    try {
      const data = await api.sendChat({
        message: questionText,
        code: currentCode,
        filename: activeFile,
        language: currentLang,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        model: healthData?.model
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Local AI Error**\n\n${err.message}`
        }
      ]);
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  // Run AI Action (Explain, Debug, Find Bugs, Fix, Optimize, Tests, Security, Complexity)
  async function handleRunAction(actionId) {
    if (!activeFile || !files[activeFile] || busy || isAnalyzing) return;
    const currentCode = files[activeFile].content;
    const currentLang = files[activeFile].language || "python";

    setIsAnalyzing(true);
    setBusy(true);
    showToast(`Running local AI action: ${actionId.toUpperCase()}...`, "info");

    try {
      const data = await api.analyzeCode({
        code: currentCode,
        language: currentLang,
        filename: activeFile,
        action: actionId,
        model: healthData?.model
      });

      setAnalysisResult(data);
      setBottomPanelTab("analysis");
      setIsBottomPanelOpen(true);

      // Append summary message to chat feed
      let chatMessage = `### 🔍 AI Analysis: ${actionId.toUpperCase()}\n\n${data.summary}\n\n`;
      if (data.issues && data.issues.length > 0) {
        chatMessage += `**Issues Detected:**\n`;
        data.issues.forEach((iss) => {
          chatMessage += `- **Line ${iss.line || "?"} [${iss.severity || "INFO"}]:** ${iss.description || iss.message}\n`;
        });
        chatMessage += `\n`;
      }
      if (data.suggestions && data.suggestions.length > 0) {
        chatMessage += `**Recommendations:**\n`;
        data.suggestions.forEach((sug) => {
          chatMessage += `- ${sug}\n`;
        });
        chatMessage += `\n`;
      }
      if (data.fixed_code) {
        chatMessage += `**Suggested Solution:**\n\`\`\`${currentLang}\n${data.fixed_code}\n\`\`\`\n`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Run AI action: ${actionId.toUpperCase()}` },
        { role: "assistant", content: chatMessage }
      ]);
      showToast(`Analysis complete for ${actionId}`, "success");
    } catch (err) {
      showToast(`Analysis failed: ${err.message}`, "error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ **Analysis Error:** ${err.message}` }
      ]);
    } finally {
      setIsAnalyzing(false);
      setBusy(false);
    }
  }

  // Semgrep Static Analysis scan
  async function handleRunSemgrep() {
    if (!activeFile || !files[activeFile] || isScanningSemgrep) return;
    setIsScanningSemgrep(true);
    showToast("Running Semgrep open-source static scan locally...", "info");

    try {
      const data = await api.runStaticAnalysis({
        code: files[activeFile].content,
        language: files[activeFile].language || "python",
        filename: activeFile
      });

      setSemgrepResults(data);
      setBottomPanelTab("problems");
      setIsBottomPanelOpen(true);
      showToast(`Semgrep found ${data.total_findings || 0} issue(s)`, "info");
    } catch (err) {
      showToast(`Semgrep scan failed: ${err.message}`, "error");
    } finally {
      setIsScanningSemgrep(false);
    }
  }

  // Combined AI Review (Semgrep + Qwen2.5-Coder)
  async function handleRunCombinedReview() {
    if (!activeFile || !files[activeFile] || isRunningCombinedReview || busy) return;
    setIsRunningCombinedReview(true);
    setBusy(true);
    showToast("Running Combined Review: Semgrep AST + Qwen2.5-Coder...", "info");

    try {
      const data = await api.runCombinedReview({
        code: files[activeFile].content,
        language: files[activeFile].language || "python",
        filename: activeFile,
        model: healthData?.model
      });

      // Update Semgrep findings
      if (data.semgrep_findings) {
        setSemgrepResults({
          tool: "semgrep",
          status: data.semgrep_status || "success",
          findings: data.semgrep_findings,
          total_findings: data.semgrep_findings.length
        });
      }

      // Format combined review into chat feed
      let reviewContent = `## 🛡️ Unified Code Review (${activeFile})\n\n`;
      reviewContent += `**Executive Summary:**\n${data.summary}\n\n`;

      if (data.issues_explained && data.issues_explained.length > 0) {
        reviewContent += `### Static & AI Findings Explained:\n`;
        data.issues_explained.forEach((iss) => {
          reviewContent += `#### Line ${iss.line || "?"} [${iss.severity || "WARNING"}]: ${iss.rule_id || "Issue"}\n`;
          reviewContent += `- **Meaning:** ${iss.meaning}\n`;
          reviewContent += `- **Impact:** ${iss.impact}\n`;
          reviewContent += `- **Fix:** ${iss.fix}\n\n`;
        });
      }

      if (data.recommendations && data.recommendations.length > 0) {
        reviewContent += `### Recommendations:\n`;
        data.recommendations.forEach((rec) => {
          reviewContent += `- ${rec}\n`;
        });
        reviewContent += `\n`;
      }

      if (data.fixed_code) {
        const lang = files[activeFile].language || "python";
        reviewContent += `### Corrected Code Snippet:\n\`\`\`${lang}\n${data.fixed_code}\n\`\`\`\n`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Run Full Unified Code Review on ${activeFile}` },
        { role: "assistant", content: reviewContent }
      ]);

      setAnalysisResult({
        action: "review",
        summary: data.summary,
        issues: data.issues_explained?.map((i) => ({
          line: i.line,
          severity: i.severity,
          description: `${i.meaning} (Impact: ${i.impact})`
        })) || [],
        suggestions: data.recommendations || [],
        fixed_code: data.fixed_code || "",
        complexity: data.complexity || "Analyzed",
        model: data.model,
        mode: "local"
      });

      setBottomPanelTab("problems");
      setIsBottomPanelOpen(true);
      showToast("Unified Code Review complete!", "success");
    } catch (err) {
      showToast(`Review failed: ${err.message}`, "error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ **Unified Review Error:** ${err.message}` }
      ]);
    } finally {
      setIsRunningCombinedReview(false);
      setBusy(false);
    }
  }

  // Code Execution
  async function runCurrentCode() {
    if (!activeFile || !files[activeFile] || isRunningCode) return;
    setBottomPanelTab("output");
    setIsBottomPanelOpen(true);
    setIsRunningCode(true);

    try {
      const data = await api.runCode({
        code: files[activeFile].content,
        filename: activeFile
      });
      setTerminalOutput(data);
      if (data.exit_code === 0) {
        showToast("Execution finished (exit code 0)", "success");
      } else {
        showToast("Execution error", "error");
      }
    } catch (err) {
      setTerminalOutput({
        stdout: "",
        stderr: `Failed to execute code: ${err.message}`,
        exit_code: 1,
        duration_ms: 0
      });
      showToast("Execution failed", "error");
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
    showToast("Fix applied to editor!", "success");
  };

  const currentFileObj = files[activeFile];
  const currentCode = currentFileObj?.content || "";
  const lineCount = currentCode.split("\n").length;

  const ollamaStatus = healthData?.ollama_status || "offline";
  const modelName = healthData?.model || "qwen2.5-coder:7b";
  const modelAvailable = healthData?.model_available || false;
  const isLocalActive = healthData?.local_ai_active || false;
  const semgrepFindings = semgrepResults?.findings || [];

  return (
    <div className="app-shell">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP BAR */}
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
            <span>workspace</span>
            <span className="sep">/</span>
            <span className="active-file-tag">{activeFile}</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* LOCAL AI STATUS INDICATOR (Highly Visible) */}
          <div
            className="status-trigger-wrap"
            onClick={() => setShowStatusPanel(!showStatusPanel)}
            title="Click for Local AI status & diagnostics"
          >
            {isCheckingHealth ? (
              <span className="status-indicator-btn yellow">
                <Loader2 size={12} className="spin" /> Checking runtime...
              </span>
            ) : ollamaStatus === "connected" && modelAvailable ? (
              <span className="status-indicator-btn green">
                <span className="live-dot" />
                <strong>LOCAL AI ACTIVE</strong>
                <span className="model-subtag font-mono">{modelName}</span>
              </span>
            ) : ollamaStatus === "model_missing" ? (
              <span className="status-indicator-btn orange">
                <AlertCircle size={12} /> Model Missing ({modelName})
              </span>
            ) : (
              <span className="status-indicator-btn red">
                <XCircle size={12} /> Offline — Ollama Disconnected
              </span>
            )}
          </div>

          {/* Privacy Badge */}
          <div
            className="privacy-top-badge"
            title="Your code stays on this device. Zero cloud transmission."
            onClick={() => setShowStatusPanel(true)}
          >
            <Lock size={12} />
            <span>Privacy First</span>
          </div>

          {/* Action: Semgrep Static Scan */}
          <button
            className="topbar-action-btn"
            onClick={handleRunSemgrep}
            disabled={isScanningSemgrep}
            title="Scan code using Semgrep rules without execution"
          >
            {isScanningSemgrep ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <ShieldAlert size={13} />
            )}
            <span>Static Scan</span>
          </button>

          {/* Action: Run Python Code */}
          <button
            className="run-code-btn"
            onClick={runCurrentCode}
            disabled={isRunningCode}
            title="Execute Python script locally"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunningCode ? "Running..." : "Run Code"}</span>
          </button>

          {/* Architecture / Quick Guide */}
          <button
            className="icon-btn-pill"
            title="Quick Start & Guide"
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
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          semgrepFindingCount={semgrepFindings.length}
        />

        {/* Left Sidebar Panel */}
        {isSidebarOpen && (
          <div className="sidebar-drawer">
            {activeSidebarTab === "files" && (
              <Explorer
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onClose={() => setIsSidebarOpen(false)}
              />
            )}

            {activeSidebarTab === "tools" && (
              <AIToolsPanel
                activeFile={activeFile}
                onRunAction={handleRunAction}
                isAnalyzing={isAnalyzing || busy}
              />
            )}

            {activeSidebarTab === "review" && (
              <CodeReviewPanel
                activeFile={activeFile}
                semgrepResults={semgrepResults}
                isScanningSemgrep={isScanningSemgrep}
                onRunSemgrep={handleRunSemgrep}
                onRunCombinedReview={handleRunCombinedReview}
                isRunningCombinedReview={isRunningCombinedReview}
                onAskAIForFix={askAI}
                onSelectLine={() => {}}
              />
            )}

            {activeSidebarTab === "history" && (
              <HistoryPanel
                messages={messages}
                onSelectMessage={askAI}
                onClearHistory={() =>
                  setMessages([
                    {
                      role: "assistant",
                      content: "Session cleared. What would you like to work on?"
                    }
                  ])
                }
              />
            )}

            {activeSidebarTab === "settings" && (
              <SettingsPanel
                healthData={healthData}
                isCheckingHealth={isCheckingHealth}
                onCheckHealth={checkHealth}
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
            onNewFile={() => handleCreateFile(`script_${openFiles.length + 1}.py`)}
            onCopyCode={() => {
              navigator.clipboard?.writeText(currentCode);
              showToast("Code copied to clipboard", "info");
            }}
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

          {/* Collapsible Bottom Panel: Problems | Output | Analysis */}
          {isBottomPanelOpen && (
            <TerminalPanel
              output={terminalOutput}
              isRunning={isRunningCode}
              onRun={runCurrentCode}
              onClear={() => setTerminalOutput(null)}
              onClose={() => setIsBottomPanelOpen(false)}
              onAskAI={askAI}
              semgrepFindings={semgrepFindings}
              analysisResult={analysisResult}
              activeTab={bottomPanelTab}
              onTabChange={setBottomPanelTab}
              onOpenDiffModal={handleOpenDiffModal}
            />
          )}

          {/* Bottom Status Bar */}
          <StatusBar
            activeFile={activeFile}
            lineCount={lineCount}
            language={currentFileObj?.language || "python"}
            backendOnline={healthData?.backend_status === "ok"}
            ollamaOnline={ollamaStatus === "connected" && modelAvailable}
            modelName={modelName}
            semgrepAvailable={healthData?.semgrep_available || false}
            problemsCount={semgrepFindings.length}
            onToggleTerminal={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
            onOpenProblems={() => {
              setBottomPanelTab("problems");
              setIsBottomPanelOpen(true);
            }}
            isTerminalOpen={isBottomPanelOpen}
          />
        </main>

        {/* Right Panel — CodeSaathi AI Assistant */}
        <AIAssistant
          messages={messages}
          busy={busy}
          onSendMessage={askAI}
          onRunAction={handleRunAction}
          activeFile={activeFile}
          onNewChat={() =>
            setMessages([
              {
                role: "assistant",
                content:
                  "New conversation started. Ask me to explain code, debug errors, or run a security audit!"
              }
            ])
          }
          onOpenDiffModal={handleOpenDiffModal}
          ollamaOnline={ollamaStatus === "connected" && modelAvailable}
          modelName={modelName}
          availableModels={healthData?.available_models || []}
          onSelectModel={(m) => setHealthData((prev) => ({ ...prev, model: m }))}
          onRunSemgrep={handleRunSemgrep}
          onRunCombinedReview={handleRunCombinedReview}
          isRunningCombinedReview={isRunningCombinedReview}
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