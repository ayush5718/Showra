"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Code, Eye } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

type TabType = "markdown" | "preview";

export function READMEPreview() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("preview");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(demoREADME);
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
      <div className="relative min-h-[250px] sm:min-h-[300px] max-h-[400px] sm:max-h-[450px] overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              <div className="markdown-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {demoREADME}
                </ReactMarkdown>
              </div>
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
                <code className="text-white/80">{demoREADME}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
          .markdown-preview {
            color: #c9d1d9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
          }

          @media (min-width: 640px) {
            .markdown-preview {
              font-size: 16px;
            }
          }

          .markdown-preview h1 {
            font-size: 1.5em;
            margin: 0.67em 0;
            font-weight: 600;
            padding-bottom: 0.3em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: #f0f6fc;
          }

          @media (min-width: 640px) {
            .markdown-preview h1 {
              font-size: 2em;
            }
          }

          .markdown-preview h2 {
            font-size: 1.25em;
            margin: 1em 0 0.5em 0;
            font-weight: 600;
            padding-bottom: 0.3em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: #f0f6fc;
          }

          @media (min-width: 640px) {
            .markdown-preview h2 {
              font-size: 1.5em;
            }
          }

          .markdown-preview h3 {
            font-size: 1.1em;
            margin: 1em 0 0.5em 0;
            font-weight: 600;
            color: #f0f6fc;
          }

          @media (min-width: 640px) {
            .markdown-preview h3 {
              font-size: 1.25em;
            }
          }

          .markdown-preview p {
            margin: 0 0 12px 0;
            color: #c9d1d9;
          }

          @media (min-width: 640px) {
            .markdown-preview p {
              margin: 0 0 16px 0;
            }
          }

          .markdown-preview ul,
          .markdown-preview ol {
            margin: 0 0 12px 0;
            padding-left: 1.5em;
            color: #c9d1d9;
          }

          @media (min-width: 640px) {
            .markdown-preview ul,
            .markdown-preview ol {
              margin: 0 0 16px 0;
              padding-left: 2em;
            }
          }

          .markdown-preview li {
            margin: 0.25em 0;
            color: #c9d1d9;
          }

          .markdown-preview li p {
            margin: 0;
          }

          .markdown-preview a {
            color: #58a6ff;
            text-decoration: none;
          }

          .markdown-preview a:hover {
            text-decoration: underline;
          }

          .markdown-preview strong {
            font-weight: 600;
            color: #f0f6fc;
          }

          .markdown-preview code:not(pre code) {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            background-color: rgba(110, 118, 129, 0.4);
            border-radius: 6px;
            color: #f0f6fc;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }

          .markdown-preview pre {
            padding: 12px;
            overflow: auto;
            font-size: 80%;
            line-height: 1.45;
            background-color: #161b22;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin: 0 0 12px 0;
          }

          @media (min-width: 640px) {
            .markdown-preview pre {
              padding: 16px;
              font-size: 85%;
              margin: 0 0 16px 0;
            }
          }

          .markdown-preview pre code {
            display: inline;
            padding: 0;
            margin: 0;
            overflow: visible;
            line-height: inherit;
            word-wrap: normal;
            background-color: transparent;
            border: 0;
            color: #c9d1d9;
          }

          .markdown-preview img {
            max-width: 100%;
            box-sizing: content-box;
            background-color: #0d1117;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            margin: 12px 0;
          }

          @media (min-width: 640px) {
            .markdown-preview img {
              margin: 16px 0;
            }
          }

          .markdown-preview hr {
            height: 0.25em;
            padding: 0;
            margin: 16px 0;
            background-color: rgba(255, 255, 255, 0.1);
            border: 0;
          }

          @media (min-width: 640px) {
            .markdown-preview hr {
              margin: 24px 0;
            }
          }

          .markdown-preview blockquote {
            padding: 0 1em;
            color: #8b949e;
            border-left: 0.25em solid rgba(255, 255, 255, 0.1);
            margin: 0 0 16px 0;
          }
        `
      }} />
    </motion.div>
  );
}

