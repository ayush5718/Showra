"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Edit2, Settings, Eye, EyeOff, Type, Layers, Zap, X, Code, Eye as EyeIcon } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { parseReadmeSections, getSectionDisplayName, toggleSectionVisibility, applyFontToContent } from "./READMEUtils";

interface READMEPreviewProps {
  readmeContent?: string;
  onContentChange?: (content: string) => void;
}

type TabType = "preview" | "edit" | "markdown";

export function READMEPreview({ readmeContent, onContentChange }: READMEPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [showSettings, setShowSettings] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [selectedFonts, setSelectedFonts] = useState({
    header: "Segoe UI",
    body: "Segoe UI",
    code: "Courier New",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize and update editable content from prop
  useEffect(() => {
    if (readmeContent !== undefined && readmeContent !== editedContent) {
      setEditedContent(readmeContent);
      
      // Initialize visibility from content
      const parsed = parseReadmeSections(readmeContent);
      const visibility: Record<string, boolean> = {};
      parsed.forEach(section => {
        visibility[section.id] = !readmeContent.includes(`<!-- HIDDEN: ${section.id} -->`);
      });
      setSectionVisibility(visibility);
    }
  }, [readmeContent]);

  // Parse sections from README
  const sections = useMemo(() => {
    const parsed = parseReadmeSections(editedContent);
    return parsed.map(section => ({
      id: section.id,
      name: section.name,
      visible: sectionVisibility[section.id] !== undefined 
        ? sectionVisibility[section.id] 
        : !editedContent.includes(`<!-- HIDDEN: ${section.id} -->`),
      displayName: getSectionDisplayName(section.id, section.name),
    }));
  }, [editedContent, sectionVisibility]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    const currentVisible = sectionVisibility[sectionId] !== false;
    const newVisible = !currentVisible;
    
    setSectionVisibility(prev => ({
      ...prev,
      [sectionId]: newVisible,
    }));
    
    const newContent = toggleSectionVisibility(editedContent, sectionId, newVisible);
    handleContentChange(newContent);
  };

  // Apply font changes
  const applyFont = (elementType: 'header' | 'body' | 'code', fontFamily: string) => {
    setSelectedFonts(prev => ({ ...prev, [elementType]: fontFamily }));
    const newContent = applyFontToContent(editedContent, elementType, fontFamily);
    handleContentChange(newContent);
  };

  // Reset to original
  const handleReset = () => {
    if (readmeContent !== undefined) {
      setEditedContent(readmeContent);
      handleContentChange(readmeContent);
      setSectionVisibility({});
      setSelectedFonts({
        header: "Segoe UI",
        body: "Segoe UI",
        code: "Courier New",
      });
    }
  };

  const content = editedContent || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-white/5 to-white/3 px-3 sm:px-5 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5 sm:gap-2">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/60">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate max-w-[80px] sm:max-w-none font-medium">README.md</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              showSettings
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
            }`}
            title="Toggle Settings"
          >
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
            title="Copy README"
        >
          {copied ? (
            <>
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      </div>

      {/* Settings Dialog Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Settings Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-[calc(100vw-2rem)] sm:w-[90vw] sm:max-w-2xl max-h-[calc(100vh-2rem)] bg-black/98 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-cyan-400" />
                  README Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  title="Close Settings"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Section Visibility Toggles */}
                <div className="mb-6">
                  <h4 className="text-white/80 text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Layers className="h-3.5 w-3.5" />
                    Sections ({sections.length})
                  </h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {sections.length === 0 ? (
                    <p className="text-white/40 text-xs text-center py-4 italic">No sections detected</p>
                  ) : (
                    sections.map(section => (
                      <label
                        key={section.id}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={() => toggleSection(section.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="text-white/80 text-xs flex-1 font-medium">{section.displayName || section.name}</span>
                        {section.visible ? (
                          <Eye className="h-3.5 w-3.5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Font Options */}
              <div className="mb-6">
                <h4 className="text-white/80 text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Type className="h-3.5 w-3.5" />
                  Typography
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block font-medium">Headers</label>
                    <select
                      value={selectedFonts.header}
                      onChange={(e) => applyFont('header', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    >
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Helvetica Neue">Helvetica Neue</option>
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block font-medium">Body Text</label>
                    <select
                      value={selectedFonts.body}
                      onChange={(e) => applyFont('body', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    >
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Helvetica Neue">Helvetica Neue</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block font-medium">Code/Technical</label>
                    <select
                      value={selectedFonts.code}
                      onChange={(e) => applyFont('code', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    >
                      <option value="Courier New">Courier New</option>
                      <option value="Consolas">Consolas</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Menlo">Menlo</option>
                      <option value="SF Mono">SF Mono</option>
                    </select>
                  </div>
                </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/80 text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Zap className="h-3.5 w-3.5" />
                    Actions
                  </h4>
                  <button
                    onClick={handleReset}
                    disabled={!readmeContent}
                    className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Reset to Original
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab Area */}
      <div className="flex-1">
      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/3">
        <button
          onClick={() => setActiveTab("preview")}
          className={`relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium transition-all ${
            activeTab === "preview"
              ? "text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
              <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Preview</span>
          {activeTab === "preview" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium transition-all ${
            activeTab === "edit"
              ? "text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Edit</span>
          {activeTab === "edit" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("markdown")}
          className={`relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium transition-all ${
            activeTab === "markdown"
              ? "text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Markdown</span>
          {activeTab === "markdown" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
          <div className="relative min-h-[400px] sm:min-h-[500px] max-h-[600px] sm:max-h-[800px] overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 bg-[#0d1117] min-h-full"
            >
                  <div className="markdown-preview github-markdown-body" style={{ isolation: 'isolate', contain: 'style' }}>
                    {content.trim() ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {content}
                </ReactMarkdown>
                    ) : (
                      <p className="text-white/40 italic text-sm text-center py-12">
                        Preview will appear here as you edit your README...
                      </p>
                    )}
              </div>
                  <p className="mt-6 text-xs text-white/40 text-center italic">
                    Preview matches GitHub's markdown rendering
                  </p>
            </motion.div>
          ) : activeTab === "edit" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 h-full"
            >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/60">
                      {content.length.toLocaleString()} characters
                    </span>
                  </div>
              <textarea
                    ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full min-h-[400px] font-mono text-xs sm:text-sm leading-relaxed text-white/90 bg-black/40 border border-white/10 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="Edit your README markdown here..."
                spellCheck={false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="markdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              <pre className="font-mono text-xs sm:text-sm leading-relaxed text-white/90 whitespace-pre-wrap break-words overflow-x-auto">
                    <code className="text-white/80">{content || "Your markdown code will appear here..."}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          /* GitHub-compatible markdown styles */
          .markdown-preview {
            color: #c9d1d9 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            word-wrap: break-word !important;
            isolation: isolate !important;
          }

          @media (min-width: 640px) {
            .markdown-preview {
              font-size: 16px;
            }
          }

          .markdown-preview h1 {
            font-size: 2em !important;
            margin: 0.67em 0 !important;
            font-weight: 600 !important;
            padding-bottom: 0.3em !important;
            border-bottom: 1px solid #30363d !important;
            color: #f0f6fc !important;
          }

          .markdown-preview h2 {
            font-size: 1.5em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            padding-bottom: 0.3em !important;
            border-bottom: 1px solid #30363d !important;
            color: #f0f6fc !important;
          }

          .markdown-preview h3 {
            font-size: 1.25em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            color: #f0f6fc !important;
          }
          
          .markdown-preview h4 {
            font-size: 1em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            color: #f0f6fc !important;
          }

          .markdown-preview p {
            margin: 0 0 16px 0 !important;
            color: #c9d1d9 !important;
          }

          .markdown-preview ul,
          .markdown-preview ol {
            margin: 0 0 16px 0 !important;
            padding-left: 2em !important;
            color: #c9d1d9 !important;
          }

          .markdown-preview li {
            margin: 0.25em 0 !important;
            color: #c9d1d9 !important;
          }

          .markdown-preview a {
            color: #58a6ff !important;
            text-decoration: none !important;
          }

          .markdown-preview a:hover {
            text-decoration: underline !important;
          }

          .markdown-preview strong {
            font-weight: 600 !important;
            color: #f0f6fc !important;
          }

          .markdown-preview code:not(pre code) {
            padding: 0.2em 0.4em !important;
            margin: 0 !important;
            font-size: 85% !important;
            background-color: rgba(110, 118, 129, 0.4) !important;
            border-radius: 6px !important;
            color: #f0f6fc !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
          }

          .markdown-preview pre {
            padding: 16px !important;
            overflow: auto !important;
            font-size: 85% !important;
            line-height: 1.45 !important;
            background-color: #161b22 !important;
            border-radius: 6px !important;
            border: 1px solid #30363d !important;
            margin: 0 0 16px 0 !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
          }

          .markdown-preview pre code {
            display: inline !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            line-height: inherit !important;
            word-wrap: normal !important;
            background-color: transparent !important;
            border: 0 !important;
            color: #c9d1d9 !important;
          }

          .markdown-preview img {
            max-width: 100% !important;
            box-sizing: content-box !important;
            background-color: #0d1117 !important;
            border: 1px solid #30363d !important;
            border-radius: 6px !important;
            margin: 16px 0 !important;
          }

          .markdown-preview table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            display: block !important;
            width: max-content !important;
            max-width: 100% !important;
            overflow: auto !important;
            margin: 16px 0 !important;
          }
          
          .markdown-preview table th,
          .markdown-preview table td {
            padding: 6px 13px !important;
            border: 1px solid #30363d !important;
          }
          
          .markdown-preview table th {
            font-weight: 600 !important;
            background-color: #161b22 !important;
          }
          
          .markdown-preview table tr {
            background-color: #0d1117 !important;
            border-top: 1px solid #21262d !important;
          }
          
          .markdown-preview table tr:nth-child(2n) {
            background-color: #161b22 !important;
          }

          .markdown-preview hr {
            height: 0.25em !important;
            padding: 0 !important;
            margin: 24px 0 !important;
            background-color: #21262d !important;
            border: 0 !important;
          }

          .markdown-preview blockquote {
            padding: 0 1em !important;
            color: #8b949e !important;
            border-left: 0.25em solid #30363d !important;
            margin: 0 0 16px 0 !important;
          }
        `
      }} />
    </motion.div>
  );
}
