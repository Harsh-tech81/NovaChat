import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import Message from "./Message";
function ChatBox() {
  const { selectedChat, theme } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* chat messages */}
      <div className="flex-1 mb-5 overflow-y-scroll">
        {messages?.length == 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {/* Three dots for msg loading */}
        {loading && (
          <div className="flex items-center gap-1.5 loader">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>
      {/* Prompt Input Box */}
      <form  className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full flex items-center w-full max-w-2xl p-3 pl-4 mx-auto gap-4 ">
        <select
          className="text-sm pl-3 pr-2 outline-none"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          <option className="dark:bg-purple-900" value="image">
            Image
          </option>
        </select>
        <input
          type="text"
          placeholder="Type your prompt here..."
          value={prompt}
          className="flex-1 w-full text-sm outline-none"
          required
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
          />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
