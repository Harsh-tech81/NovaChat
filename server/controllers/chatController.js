
import Chat from '../models/Chat.js';

// API Controller for chat-related operations
export const createChat=async (req,res)=>{
    try{
        const userId=req.user._id
        const chatData={
            userId,
            messages:[],
            userName:req.user.name,
            name:"New Chat"
        }
        await Chat.create(chatData)
        return res.status(201).json({ message: "Chat created", success: true });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
}

// API Controller for getting all chats of a user
export const getChats=async (req,res)=>{
    try{
        const userId=req.user._id
        const chats=await Chat.find({userId}).sort({updatedAt:-1})
        return res.status(200).json({ success: true, chats });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }  
}        

// API to delete selected Chat
export const deleteChat=async (req,res)=>{
try{
    const { chatId } = req.body;
    const userId=req.user._id
    await Chat.deleteOne({ _id: chatId, userId });
    return res.status(200).json({ message: "Chat Deleted", success: true });
}
catch(err){
    return res.status(500).json({ message: err.message, success: false });
}
}
