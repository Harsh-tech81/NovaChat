// Text-based AI chat message controller

import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
        if (req.user.credits < 1) {
      return res.status(400).json({
        message: "You don't have enough credits to use this feature",
        success: false,
      });
    }
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

// Image Generation Message Controller

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    //  check credits bcz image generation takes atleast 2 credits
    if (req.user.credits < 2) {
      return res.status(400).json({
        message: "You don't have enough credits for image generation",
        success: false,
      });
    }
    const { prompt, chatId, isPublished } = req.body;
    // Find Chat
    const chat = await Chat.findOne({ _id: chatId, userId });
    // Add user message to chat
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    // Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);
    // Construct the Imagekit AI generation URL
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/NovaChat/${Date.now()}.png?tr=w-800,h-800`;
    // trigger generation by fetching from Imagekit

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });
    // Convert to Base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;
    // Uplaod to ImageKit Media Library
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "NovaChat",
    });
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ reply, success: true });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};


