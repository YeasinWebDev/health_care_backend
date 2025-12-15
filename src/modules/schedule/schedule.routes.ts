import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const scheduleRoutes = Router();

scheduleRoutes.get("/my-schedule", auth(UserRole.DOCTOR), scheduleController.getMySchedule);
scheduleRoutes.get("/all", auth(UserRole.ADMIN), scheduleController.getAllSchedule);
scheduleRoutes.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR ,UserRole.PATIENT), scheduleController.scheduleForDoctor);

scheduleRoutes.get("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT), scheduleController.getScheduleById);

scheduleRoutes.post("/create", auth(UserRole.ADMIN), scheduleController.createSchedule);
scheduleRoutes.delete("/:id", auth(UserRole.ADMIN), scheduleController.deleteSchedule);
scheduleRoutes.delete("/my-schedule/:id", auth(UserRole.DOCTOR), scheduleController.deleteMyScheduleById);
// scheduleRoutes.post("/delete", scheduleController.deleteAllSchedule)
// scheduleRoutes.get("/all", scheduleController.allSchedule)
