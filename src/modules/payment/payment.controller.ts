import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helper/stripe";
import AppError from "../../helper/appError";

const checkWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret!);
  } catch (err) {
    throw new AppError("Webhook Error", 400);
  }

  const result = await PaymentService.checkWebhook(event);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment created successfully!",
    data: result,
  });
});

export const PaymentController = {
  checkWebhook,
};
