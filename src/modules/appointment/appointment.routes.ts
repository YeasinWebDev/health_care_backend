import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const appointmentRoutes = Router();

appointmentRoutes.post("/", auth(UserRole.PATIENT), AppointmentController.createAppointment);
