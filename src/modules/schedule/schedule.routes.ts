import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const scheduleRoutes = Router();

scheduleRoutes.post("/create", auth( UserRole.ADMIN), scheduleController.createSchedule);
scheduleRoutes.get("/", auth( UserRole.ADMIN), scheduleController.scheduleForDoctor);
scheduleRoutes.delete("/:id", auth( UserRole.ADMIN), scheduleController.deleteSchedule);

// scheduleRoutes.post("/delete", scheduleController.deleteAllSchedule)
// scheduleRoutes.get("/all", scheduleController.allSchedule)
