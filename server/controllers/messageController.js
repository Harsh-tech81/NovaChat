// Text-based AI chat message controller
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ reply, success: true });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};
