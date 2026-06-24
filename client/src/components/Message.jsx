import { assets } from "../assets/assets";
import moment from "moment";
import { useEffect } from "react";
import Markdown from "react-markdown";
import Prism from "prismjs";
function Message({ message }) {
  
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start gap-2 justify-end my-4">
          <div className="flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-primary">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).format("MMM DD, YYYY, hh:mm A")}
            </span>
          </div>
          <img src={assets.user_icon} alt="User" className="w-8 rounded-full" />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4">
          {message.isImage ? (
            <img
              src={message.content}
              alt="AI"
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div className="text-sm dark:text-primary reset-tw">
              <Markdown>{message.content}</Markdown>
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
