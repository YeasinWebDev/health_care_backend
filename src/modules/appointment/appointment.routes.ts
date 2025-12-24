import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { paymentLimiter } from "../../middlewares/rateLimiter";
import { validateRequest } from "../../middlewares/vaildateRequest";
import { AppointmentValidation } from "./appointment.validation";

export const appointmentRoutes = Router();

appointmentRoutes.get("/my-appointments", auth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.myAppointments);
appointmentRoutes.get("/", auth(UserRole.ADMIN), AppointmentController.getAllAppointments);

appointmentRoutes.post("/", auth(UserRole.PATIENT), AppointmentController.createAppointment);

appointmentRoutes.post(
    '/pay-later',
    auth(UserRole.PATIENT),
    validateRequest(AppointmentValidation.createAppointment),
    AppointmentController.createAppointmentWithPayLater
);

appointmentRoutes.post(
    '/:id/initiate-payment',
    auth(UserRole.PATIENT),
    paymentLimiter,
    AppointmentController.initiatePayment
);
appointmentRoutes.patch("/:id", auth(UserRole.DOCTOR), AppointmentController.updateAppointmentStatus);
