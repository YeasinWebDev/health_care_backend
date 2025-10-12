import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { ISortBy } from "../../type";
import { UserRole, UserStatus } from "@prisma/client";

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

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
