import { Router } from "express";
import { PatientController } from "./patient.controller";


export const  patientRoutes = Router()

patientRoutes.get("/", PatientController.getAllPatients)

patientRoutes.get("/:id", PatientController.getSinglePatient)

patientRoutes.patch("/:id", PatientController.updatePatient)

patientRoutes.delete("/:id", PatientController.deletePatient)