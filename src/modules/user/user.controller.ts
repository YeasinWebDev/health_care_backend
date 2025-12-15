import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { ISortBy } from "../../type";
import { UserRole, UserStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req.body, req.file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient created successfully!",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
const result = await UserService.createAdmin(req.body, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Created successfuly!",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createDoctor(req.body, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Created successfuly!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, sortBy, sortOrder, role, status } = req.query;

  const result = await UserService.getallFromDB(
    Number(page || 1),
    Number(limit || 10),
    search as string,
    sortBy as ISortBy["sortBy"],
    sortOrder as "asc" | "desc" | undefined,
    role as UserRole | undefined,
    status as UserStatus | undefined
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get all users successfully! ",
    data: result,
  });
});

const me = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const result = await UserService.me(req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User data fetched successfully",
    data: result,
  });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.changeProfileStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status changed successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User data fetched successfully",
    data: result,
  });
});


const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateAdmin(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin updated successfully!",
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteAdmin(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully!",
    data: result,
  });
})

const updateMyProfile = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {

    const user = req.user;

    const result = await UserService.updateMyProfie(user as JwtPayload,req.body, req.file);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "My profile updated!",
        data: result
    })
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
  me,
  changeProfileStatus,
  getUserById,
  updateAdmin,
  deleteAdmin,
  updateMyProfile
};
