"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Code, Eye, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Demo README content
const demoREADME = `# Hi there, I'm John Doe 👋

## 🚀 About Me
Full-stack developer passionate about building beautiful and functional applications. Open source enthusiast and tech blogger.

## 💻 Tech Stack
- **Frontend:** TypeScript, React, Next.js
- **Backend:** Node.js, Python, Go
- **Tools:** Docker, Kubernetes, AWS

## 🔥 My Top Repositories
- [awesome-project](https://github.com/johndoe/awesome-project) - A modern web application
- [cool-library](https://github.com/johndoe/cool-library) - Utility library for JavaScript
- [api-server](https://github.com/johndoe/api-server) - RESTful API server

## 📫 Connect with Me
- GitHub: [@johndoe](https://github.com/johndoe)
- Twitter: [@johndoe](https://twitter.com/johndoe)
- Website: [johndoe.dev](https://johndoe.dev)

---

⭐️ From [@johndoe](https://github.com/johndoe)`;

type TabType = "markdown" | "preview" | "edit";

interface READMEPreviewProps {
  readmeContent?: string;
  onContentChange?: (content: string) => void;
}

export function READMEPreview({ readmeContent, onContentChange }: READMEPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [editableContent, setEditableContent] = useState<string>("");

  // Initialize and update editable content from prop
  useEffect(() => {
    if (readmeContent !== undefined) {
      setEditableContent(readmeContent);
    } else if (!editableContent) {
      setEditableContent(demoREADME);
    }
  }, [readmeContent]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const content = editableContent || demoREADME;

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
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-white/5 to-white/3 px-3 sm:px-5 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5 sm:gap-2">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/60">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate max-w-[80px] sm:max-w-none">README.md</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Copy README</span>
              <span className="sm:hidden">Copy</span>
            </>
          )}
        </button>
      </div>

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
          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      <div className="relative min-h-[250px] sm:min-h-[300px] max-h-[400px] sm:max-h-[800px] lg:max-h-[900px] overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 bg-[#0d1117]"
            >
              <div className="markdown-preview github-markdown-body" style={{ isolation: 'isolate', contain: 'style' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {content}
                </ReactMarkdown>
              </div>
              <p className="mt-4 text-xs text-white/40 text-center italic">
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
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full min-h-[300px] font-mono text-xs sm:text-sm leading-relaxed text-white/90 bg-black/30 border border-white/10 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
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
                <code className="text-white/80">{content}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
          /* GitHub-compatible markdown styles - matches GitHub's exact rendering */
          .markdown-preview {
            color: #c9d1d9 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            word-wrap: break-word !important;
            isolation: isolate !important;
            all: revert-layer;
          }
          
          /* Reset any global font inheritance */
          .markdown-preview * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          @media (min-width: 640px) {
            .markdown-preview {
              font-size: 16px;
            }
          }

          /* GitHub heading styles - no custom fonts, only GitHub's system fonts */
          .markdown-preview h1 {
            font-size: 2em !important;
            margin: 0.67em 0 !important;
            font-weight: 600 !important;
            padding-bottom: 0.3em !important;
            border-bottom: 1px solid #30363d !important;
            color: #f0f6fc !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          .markdown-preview h2 {
            font-size: 1.5em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            padding-bottom: 0.3em !important;
            border-bottom: 1px solid #30363d !important;
            color: #f0f6fc !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          .markdown-preview h3 {
            font-size: 1.25em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            color: #f0f6fc !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }
          
          .markdown-preview h4 {
            font-size: 1em !important;
            margin: 1em 0 0.5em 0 !important;
            font-weight: 600 !important;
            color: #f0f6fc !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          /* GitHub body text styles */
          .markdown-preview p {
            margin: 0 0 16px 0 !important;
            color: #c9d1d9 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          .markdown-preview ul,
          .markdown-preview ol {
            margin: 0 0 16px 0 !important;
            padding-left: 2em !important;
            color: #c9d1d9 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          .markdown-preview li {
            margin: 0.25em 0 !important;
            color: #c9d1d9 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          .markdown-preview li p {
            margin: 0 !important;
          }

          /* GitHub link styles */
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }

          /* GitHub code styles */
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
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
          }

          /* GitHub image styles */
          .markdown-preview img {
            max-width: 100% !important;
            box-sizing: content-box !important;
            background-color: #0d1117 !important;
            border: 1px solid #30363d !important;
            border-radius: 6px !important;
            margin: 16px 0 !important;
          }

          /* HTML elements support */
          .markdown-preview h1[align],
          .markdown-preview h2[align],
          .markdown-preview h3[align],
          .markdown-preview p[align] {
            text-align: inherit;
          }

          .markdown-preview h1[align="center"],
          .markdown-preview h2[align="center"],
          .markdown-preview h3[align="center"],
          .markdown-preview p[align="center"] {
            text-align: center;
          }

          .markdown-preview h1[align="left"],
          .markdown-preview h2[align="left"],
          .markdown-preview h3[align="left"],
          .markdown-preview p[align="left"] {
            text-align: left;
          }

          .markdown-preview h1[align="right"],
          .markdown-preview h2[align="right"],
          .markdown-preview h3[align="right"],
          .markdown-preview p[align="right"] {
            text-align: right;
          }

          .markdown-preview img[align="right"] {
            float: right;
            margin-left: 16px;
            margin-bottom: 16px;
          }

          .markdown-preview img[align="left"] {
            float: left;
            margin-right: 16px;
            margin-bottom: 16px;
          }

          .markdown-preview img[align="center"] {
            display: block;
            margin-left: auto;
            margin-right: auto;
          }

          .markdown-preview iframe {
            width: 100%;
            max-width: 100%;
            border: none;
            border-radius: 8px;
            margin: 16px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }

          .markdown-preview div[align="center"] {
            text-align: center;
            margin: 16px 0;
          }

          .markdown-preview table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          .markdown-preview table {
            border-spacing: 12px;
            border-collapse: separate;
          }

          .markdown-preview table td {
            padding: 16px;
            vertical-align: top;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 12px;
          }

          .markdown-preview table td h3 {
            color: #ffffff !important;
            margin-top: 0 !important;
            margin-bottom: 12px !important;
          }

          .markdown-preview table td h3 a {
            color: #58A6FF !important;
            text-decoration: none;
            font-weight: 600;
          }

          .markdown-preview table td h3 a:hover {
            text-decoration: underline;
          }

          .markdown-preview table td p {
            color: rgba(255, 255, 255, 0.95) !important;
            margin: 12px 0 !important;
          }

          .markdown-preview div[style*="background-color"] {
            margin: 12px 0 !important;
          }

          .markdown-preview div[style*="background-color"] p {
            margin: 0 !important;
          }

          .markdown-preview div[style*="display: flex"],
          .markdown-preview div[style*="display:inline-flex"] {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            align-items: center !important;
          }

          .markdown-preview div[style*="display: flex"] > div,
          .markdown-preview div[style*="display:inline-flex"] > div {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .markdown-preview div[style*="display: flex"] img,
          .markdown-preview div[style*="display:inline-flex"] img {
            margin: 0 !important;
            vertical-align: middle !important;
          }


          .markdown-preview table td img {
            margin: 4px;
            vertical-align: middle;
          }

          /* GitHub horizontal rule and blockquote */
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
          }
          
          /* GitHub table styles */
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
        `
      }} />
    </motion.div>
  );
}

