
import User from "../models/User.js";
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';
// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// API to register the User 
export const registerUser = async (req, res) => {
        const { name, email, password } = req.body;
        try{
            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if(existingUser){
                return res.status(400).json({ message: "User already exists",success:false });
            }   
            const newUser = await User.create({ name, email, password });
            const token = generateToken(newUser._id);
            await newUser.save();
            res.status(201).json({ message: "User registered successfully", success: true, token });
        }
        catch(error){
            console.error(error);
          return res.status(500).json({ message:error.message,success:false });
        }
}

// API to login the User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found",success:false });
        }   
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid Password",success:false });
        }
        const token = generateToken(user._id);
       return res.status(200).json({ message: "User logged in successfully", success: true, token });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message:error.message,success:false });
    }
}

// API to get the User Data
export const getUserData = async (req, res) => {
    try{
      const user=req.user;
      return res.json({ success: true, user });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
}


