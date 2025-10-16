import { UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../../helper/jwtToken";
import AppError from "../../helper/appError";

const login = async (payload: any) => {
  const result = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if(!result) {
    throw new AppError("User not found!",400); 
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, result?.password as string);

  if (!isPasswordMatch) {
    throw new AppError("Invalid password!",400);
  }

  const token = generateToken({ email: result?.email as string, role: result?.role as string });

  return { token, user: result };
};

export const authService = {
  login,
};
