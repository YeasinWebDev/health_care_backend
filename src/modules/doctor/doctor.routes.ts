import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const doctorRoutes = Router();

doctorRoutes.post("/suggestion", DoctorController.getAISuggestion);

doctorRoutes.get("/", DoctorController.getAllFromDB);

doctorRoutes.patch("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), DoctorController.updateDoctor);

doctorRoutes.get("/:id", DoctorController.getSingleDoctor);

doctorRoutes.delete("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), DoctorController.deleteDoctor);
