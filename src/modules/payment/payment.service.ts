import Stripe from "stripe";
import { prisma } from "../../config/db";
import { PaymentStatus } from "@prisma/client";

const checkWebhook = async (event: Stripe.Event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const appointmentId = session?.metadata?.appointmentId;
    const paymentId = session?.metadata?.paymentId;

    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      },
    });

    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        paymentGatewayData: JSON.parse(JSON.stringify(session)),
      },
    });

    return true;
  }

  return false;
};

export const PaymentService = {
  checkWebhook,
};
