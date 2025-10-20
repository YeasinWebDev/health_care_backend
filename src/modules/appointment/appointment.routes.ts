import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const appointmentRoutes = Router();

appointmentRoutes.get("/my-appointments", auth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.myAppointments);
appointmentRoutes.get("/", auth(UserRole.ADMIN), AppointmentController.getAllAppointments);

appointmentRoutes.post("/", auth(UserRole.PATIENT), AppointmentController.createAppointment);
appointmentRoutes.patch("/:id", auth(UserRole.DOCTOR), AppointmentController.updateAppointmentStatus);
