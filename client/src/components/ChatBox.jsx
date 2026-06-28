import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import { toast } from "react-hot-toast";

function ChatBox() {
  const { selectedChat, theme, user, axios, token, setUser } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast("Login to send messages");
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);
      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt, isPublished },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        // decrease user credits if mode is text
        if (mode === "text") {
          setUser((prev) => ({
            ...prev,
            credits: prev.credits - 1,
          }));
        } else {
          setUser((prev) => ({
            ...prev,
            credits: prev.credits - 2,
          }));
        }
      } else {
        toast.error(data.message || "Something went wrong");
        setPrompt(promptCopy);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* chat messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
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
      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}
      {/* Prompt Input Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full flex items-center w-full max-w-2xl p-3 pl-4 mx-auto gap-4 "
      >
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
