import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../helper/fileUploder";
import { createAdminValidationSchema, createDoctorValidationSchema, createZodPatientSchema } from "./user.validation";
import { UserController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const userRouters = Router();

userRouters.post("/create-patient", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createZodPatientSchema.parse(JSON.parse(req.body.data));
  return UserController.createPatient(req, res, next);
});

userRouters.post("/create-admin", auth(UserRole.ADMIN), upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createAdminValidationSchema.parse(JSON.parse(req.body.data));
  return UserController.createAdmin(req, res, next);
});

userRouters.post("/create-doctor", auth(UserRole.ADMIN), upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = createDoctorValidationSchema.parse(JSON.parse(req.body.data));
  return UserController.createDoctor(req, res, next);
});

userRouters.get("/me", auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT), UserController.me);
userRouters.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR), UserController.getAllFromDB);

userRouters.get("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), UserController.getUserById);

userRouters.patch("/update-my-profile", auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT), upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = JSON.parse(req.body.data);
  if (req.body?.experience && req.body?.appointmentFee) {
    req.body.experience = Number(req.body?.experience);
    req.body.appointmentFee = Number(req.body?.appointmentFee);
  }
  return UserController.updateMyProfile(req, res, next);
});

userRouters.patch("/:id", auth(UserRole.ADMIN), UserController.updateAdmin);

userRouters.patch("/status/:id", auth(UserRole.ADMIN), UserController.changeProfileStatus);

userRouters.delete("/:id", auth(UserRole.ADMIN), UserController.deleteAdmin);
