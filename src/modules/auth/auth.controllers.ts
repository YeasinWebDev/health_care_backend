import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { authService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const { token } = result;

  res.cookie("accessToken", token.accessToken, { secure: true, sameSite: "none", httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

  res.cookie("refreshToken", token.refreshToken, { secure: true, sameSite: "none", httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successfully!",
    data: result.user,
  });
});

export const authController = { login };
