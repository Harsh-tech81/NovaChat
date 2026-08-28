import { assets } from "../assets/assets";
import moment from "moment";
import { useState, useCallback } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? "copied" : ""}`}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        wrapLongLines={true}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem",
          fontSize: "0.82rem",
          background: "#1e1e1e",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function Message({ message }) {
  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start gap-2 justify-end my-4">
          <div className="flex flex-col gap-2 p-3 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-xl max-w-2xl">
            <p className="text-sm dark:text-primary">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).format("MMM DD, YYYY, hh:mm A")}
            </span>
          </div>
          <img src={assets.user_icon} alt="User" className="w-8 rounded-full mt-1" />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-4 px-5 max-w-full md:max-w-2xl lg:max-w-3xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-xl my-4">
          {message.isImage ? (
            <img
              src={message.content}
              alt="AI Generated"
              className="w-full max-w-md mt-2 rounded-lg"
            />
          ) : (
            <div className="markdown-body dark:text-primary/90">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock className={className}>
                        {children}
                      </CodeBlock>
                    );
                  },
                }}
              >
                {message.content}
              </Markdown>
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
            {moment(message.timestamp).format("MMM DD, YYYY, hh:mm A")}
          </span>
        </div>
      )}
    </div>
  );
}

export default Message;
