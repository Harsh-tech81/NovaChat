import { assets } from "../assets/assets";
import moment from "moment";
import { useState, useCallback, Children } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Reusable copy icon SVGs
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

// Copy button for messages (user/AI text)
function MessageCopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="msg-copy-btn"
      title="Copy message"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language || "text"}</span>
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? "copied" : ""}`}
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || "text"}
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

const markdownComponents = {
  // Override <pre> to intercept code blocks (fenced code)
  pre({ children }) {
    // children is typically a <code> element
    const codeElement = Children.toArray(children).find(
      (child) => child?.type === "code" || child?.props?.className
    );
    if (codeElement && codeElement.props) {
      const className = codeElement.props.className || "";
      const match = /language-(\w+)/.exec(className);
      const language = match ? match[1] : "";
      const code = String(codeElement.props.children).replace(/\n$/, "");
      return <CodeBlock language={language} code={code} />;
    }
    // Fallback: render as-is
    return <pre>{children}</pre>;
  },
  // Inline code only — no className means inline
  code({ className, children, ...props }) {
    // If it has a language class, it's inside a <pre> which is handled above
    if (className) return <code className={className} {...props}>{children}</code>;
    return <code {...props}>{children}</code>;
  },
};

function Message({ message }) {
  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start gap-2 justify-end my-4">
          <div className="msg-bubble-user group relative flex flex-col gap-2 p-3 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-xl max-w-[85vw] sm:max-w-xl md:max-w-2xl">
            <p className="text-sm dark:text-primary break-words">{message.content}</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
                {moment(message.timestamp).format("MMM DD, YYYY, hh:mm A")}
              </span>
              <MessageCopyBtn text={message.content} />
            </div>
          </div>
          <img src={assets.user_icon} alt="User" className="w-7 sm:w-8 rounded-full mt-1 shrink-0" />
        </div>
      ) : (
        <div className="msg-bubble-ai group relative inline-flex flex-col gap-2 p-4 px-4 sm:px-5 max-w-[85vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-xl my-4">
          {message.isImage ? (
            <img
              src={(!message.content || message.content === "errorImage") ? "/errorImage.png" : message.content}
              alt="AI Generated"
              className="w-full max-w-md mt-2 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/errorImage.png";
              }}
            />
          ) : (
            <div className="markdown-body dark:text-primary/90 overflow-x-auto">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {message.content}
              </Markdown>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).format("MMM DD, YYYY, hh:mm A")}
            </span>
            {!message.isImage && <MessageCopyBtn text={message.content} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;
