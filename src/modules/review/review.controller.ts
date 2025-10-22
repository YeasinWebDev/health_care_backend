import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user as JwtPayload, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review created successfully!",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await ReviewService.getAllReviews(Number(page || 1), Number(limit || 10));
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews data fetched successfully",
    data: result,
  });
});

export const ReviewController = { createReview, getAllReviews };
