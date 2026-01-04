import { Router } from "express";
import { PatientController } from "./patient.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const patientRoutes = Router();

patientRoutes.get("/", PatientController.getAllPatients);

patientRoutes.get("/my-data", auth(UserRole.PATIENT), PatientController.myPatientData);

patientRoutes.get("/:id", PatientController.getSinglePatient);

patientRoutes.patch("/", auth(UserRole.PATIENT), PatientController.updatePatient);

patientRoutes.delete("/:id", PatientController.deletePatient);
