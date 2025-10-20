import { Router } from "express";
import { PaymentController } from "./payment.controller";

export const paymentRoutes =Router()

paymentRoutes.post("/webhook", PaymentController.checkWebhook);