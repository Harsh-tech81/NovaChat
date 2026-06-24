import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { dummyUserData, dummyChats } from "../assets/assets.js";
import { useEffect } from "react";
const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const fetchUser = async () => {
    setUser(dummyUserData);
  };

  const fetchUserChats = async () => {
    setChats(dummyChats);
    setSelectedChat(dummyChats[0]);
  };

  useEffect(() => {
    fetchUser();
  }, []);

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
    if(theme==="dark"){
     document.documentElement.classList.add("dark");
    }else{
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;

};

export const useAppContext = () => useContext(AppContext);
