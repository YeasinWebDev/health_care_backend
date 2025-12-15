import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const prescriptionRoutes = Router()

prescriptionRoutes.post("/",auth(UserRole.DOCTOR), PrescriptionController.createPrescription)
prescriptionRoutes.get("/my-prescriptions", auth(UserRole.PATIENT), PrescriptionController.getMyPrescriptions)