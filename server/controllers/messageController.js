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
    // Encode the prompt (replace spaces with hyphens for ImageKit URL compatibility)
    const encodedPrompt = prompt.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    // Construct the ImageKit AI generation URL with transformation parameter
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/tr:ik-genimg-prompt-${encodedPrompt},w-800,h-800/${Date.now()}.png`;

    let imageUrl;
    try {
      // ImageKit AI generation is async — first request triggers generation,
      // subsequent requests poll until the image is ready.
      // Poll up to 30 times with 3s delay (~90s max wait).
      const MAX_RETRIES = 30;
      const POLL_INTERVAL = 3000; // 3 seconds
      let aiImageResponse = null;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const response = await axios.get(generatedImageUrl, {
            responseType: "arraybuffer",
            timeout: 60000, // 60s timeout — initial AI gen takes 20-30s
          });

          const isIntermediate = response.headers["is-intermediate-response"] === "true";
          const contentType = response.headers["content-type"] || "";

          if (!isIntermediate && contentType.startsWith("image/")) {
            // Image is ready
            aiImageResponse = response;
            break;
          }
        } catch (pollErr) {
          // Transient error (timeout, network), continue polling
          console.log(`Image poll attempt ${i + 1} failed: ${pollErr.message}`);
        }

        // Image still being generated, wait and retry
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      if (!aiImageResponse) {
        throw new Error("Image generation timed out");
      }

      // Convert to Base64
      const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;
      // Upload to ImageKit Media Library
      const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}.png`,
        folder: "NovaChat",
      });
      imageUrl = uploadResponse.url;
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr.message);
      // Use the error image fallback from client public folder
      imageUrl = "errorImage";
    }

    const reply = {
      role: "assistant",
      content: imageUrl,
      timestamp: Date.now(),
      isImage: true,
      isPublished: imageUrl !== "errorImage" ? isPublished : false,
    };

    res.json({ reply, success: true });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};


