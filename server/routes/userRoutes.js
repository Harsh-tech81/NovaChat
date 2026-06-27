import express from 'express';
import {registerUser,loginUser,getUserData,getPublishedImages} from '../controllers/userController.js';
import {protect} from '../middlewares/auth.js';
import Router from 'express';

const userRouter=express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);
userRouter.get('/published-images', getPublishedImages);

export default userRouter;