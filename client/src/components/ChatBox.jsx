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
    <div className="flex-1 flex flex-col h-screen overflow-hidden px-3 sm:px-5 md:px-10 xl:px-30 pt-3 sm:pt-5 md:pt-10 max-md:pt-14 2xl:pr-40 pb-3 sm:pb-5">
      {/* chat messages — scrollable */}
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 pb-2">
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
        {/* Loading animation */}
        {loading && (
          <div className="flex items-center gap-1.5 p-3 px-5 max-w-fit bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-xl my-2">
            <div className="flex items-center gap-1.5 loader">
              <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-300 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-300 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-300 animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom section — never scrolls */}
      <div className="shrink-0 pt-2">
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
          className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full flex items-center w-full max-w-2xl p-2.5 sm:p-3 pl-3 sm:pl-4 mx-auto gap-2 sm:gap-4"
        >
          <select
            className="text-sm pl-2 sm:pl-3 pr-1 sm:pr-2 outline-none"
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
            className="flex-1 w-full text-sm outline-none min-w-0"
            required
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button disabled={loading}>
            <img
              src={loading ? assets.stop_icon : assets.send_icon}
              className="w-7 sm:w-8 cursor-pointer shrink-0"
            />
          </button>
        </form>
      </div>
    </div>
  );
  
}

export default ChatBox;
