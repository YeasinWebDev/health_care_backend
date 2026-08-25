import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { stripe } from "../../helper/stripe";

const checkWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    await PaymentService.checkWebhook(event);

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(400).json({
      message: "Webhook Error",
    });
  }
};

export const PaymentController = {
  checkWebhook,
};
