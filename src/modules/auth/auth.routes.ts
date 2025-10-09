import { Router } from "express";
import { authController } from "./auth.controllers";

export const authRoutes = Router()

authRoutes.post('/login',authController.login)