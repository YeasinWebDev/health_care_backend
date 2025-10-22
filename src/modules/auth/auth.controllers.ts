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

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await authService.refreshToken(refreshToken);
  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token genereated successfully!",
    data: {
      message: "Access token genereated successfully!",
    },
  });
});

const changePassword = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;

  const result = await authService.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Changed successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await authService.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await authService.getMe(userSession as { accessToken: string });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrive successfully!",
    data: result,
  });
});

export const authController = { login, refreshToken, changePassword, forgotPassword, resetPassword, getMe };
