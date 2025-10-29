import { Router } from "express";
import { MetaController } from "./meta.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

export const metaRoutes = Router()


metaRoutes.get("/",auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT), MetaController.fetchDashboardMetaData)