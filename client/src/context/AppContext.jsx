import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { dummyUserData, dummyChats } from "../assets/assets.js";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!user) return toast.error("Login to create a new chat");
      navigate("/");
      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });
      await fetchUserChats();
    } catch (error) {
      toast.error(error.message || "Failed to create a new chat");
    }
  };

  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setChats(data.chats);
        // If the User has no chats,create new one
        if (data.chats.length === 0) {
          await createNewChat();
          return fetchUserChats();
        } else {
          // If the User has chats,select the first one
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message || "Failed to fetch user chats");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch user chats");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      console.log("User logged in:", user);
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = {
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    navigate,
    token,
    setToken,
    loadingUser,
    createNewChat,
    fetchUserChats,
    axios,
    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
