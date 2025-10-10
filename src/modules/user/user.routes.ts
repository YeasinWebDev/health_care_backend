import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../helper/fileUploder";
import { createAdminValidationSchema, createDoctorValidationSchema, createZodPatientSchema } from "./user.validation";
import { UserController } from "./user.controller";

export const userRouters = Router();

userRouters.post("/create-patient", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createZodPatientSchema.parse(JSON.parse(req.body.data));
  return UserController.createPatient(req, res, next);
});

userRouters.post("/create-admin", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createAdminValidationSchema.parse(JSON.parse(req.body.data));
  return UserController.createAdmin(req, res, next);
});

userRouters.post("/create-doctor", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createDoctorValidationSchema.parse(JSON.parse(req.body.data));
  return UserController.createDoctor(req, res, next);
});
