import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { upload } from "../../helper/fileUploder";
import { createZodPatientSchema } from "./user.validation";

export const userRouters = Router();

userRouters.post(
  "/create_patient",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createZodPatientSchema.parse(JSON.parse(req.body.data));
    return userController.createPatient(req, res, next);
  },
);
