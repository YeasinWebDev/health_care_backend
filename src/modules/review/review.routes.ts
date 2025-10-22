import { Router } from "express";
import { ReviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const reviewRouter = Router();

reviewRouter.post("/", auth(UserRole.PATIENT), ReviewController.createReview);
reviewRouter.get("/", ReviewController.getAllReviews);