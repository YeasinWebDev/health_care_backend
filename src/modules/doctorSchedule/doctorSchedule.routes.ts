import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
 
export const doctorScheduleRoutes = Router();

doctorScheduleRoutes.post("/", auth(UserRole.DOCTOR), doctorScheduleController.createDoctorSchedule);

doctorScheduleRoutes.delete("/", auth(UserRole.DOCTOR), doctorScheduleController.deleteDoctorSchedule);
