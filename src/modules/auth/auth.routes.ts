import { Router } from "express";
import { authController } from "./auth.controllers";
import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares/auth";

export const authRoutes = Router()

authRoutes.get(
    "/me",
    authController.getMe
)

authRoutes.post(
    "/login",
    authController.login
)

authRoutes.post(
    '/refresh-token',
    authController.refreshToken
)

authRoutes.post(
    '/change-password',
    auth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    authController.changePassword
);

authRoutes.post(
    '/forgot-password',
    authController.forgotPassword
);

authRoutes.post(
    '/reset-password',
    authController.resetPassword
)