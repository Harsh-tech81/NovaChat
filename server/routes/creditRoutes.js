import express from "express";
import {purchasePlan,getPlans} from "../controllers/creditController.js";
import {protect} from '../middlewares/auth.js';

const creditRouter = express.Router();

creditRouter.post("/purchase", protect, purchasePlan);
creditRouter.get("/plan", getPlans);

export default creditRouter;