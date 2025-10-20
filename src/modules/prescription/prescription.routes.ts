import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";

export const prescriptionRoutes = Router()

prescriptionRoutes.post("/", PrescriptionController.createPrescription)
prescriptionRoutes.get("/my-prescriptions", PrescriptionController.getMyPrescriptions)