import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const { token } = result;

  res.cookie("accessToken", token.accessToken, { secure: true, sameSite: "none", httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

  res.cookie("refreshToken", token.refreshToken, { secure: true, sameSite: "none", httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie("accessToken", "", { secure: true, sameSite: "none", httpOnly: true, maxAge: 0 });
  res.cookie("refreshToken", "", { secure: true, sameSite: "none", httpOnly: true, maxAge: 0 });
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successfully!",
    data: {},
  });
})

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);
  res.cookie("accessToken", result.tokenObj.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token generated successfully!",
    data: {
      result: result.tokenObj,
      message: "Access token generated successfully!",
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

const resetPassword = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const token = req.headers.authorization || null;
  const user = req.user
  
  await authService.resetPassword(token, req.body , user);

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

export const authController = { login, logout, refreshToken, changePassword, forgotPassword, resetPassword, getMe };
