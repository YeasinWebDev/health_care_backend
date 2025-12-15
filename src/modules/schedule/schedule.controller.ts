import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { scheduleService } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";
import { prisma } from "../../config/db";
import { JwtPayload } from "jsonwebtoken";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleService.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const scheduleForDoctor = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { page, limit, startDateTime, endDateTime, sortBy, sortOrder } = req.query;

  const result = await scheduleService.scheduleForDoctor(
    Number(page || 1),
    Number(limit || 10),
    sortBy as string,
    sortOrder as "asc" | "desc" | undefined,
    req.user as JwtPayload,
    (startDateTime as string) || "",
    (endDateTime as string) || ""
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const allSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await prisma.schedule.findMany();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const deleteAllSchedule = catchAsync(async (req: Request, res: Response) => {
  const rest = await prisma.schedule.deleteMany();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: rest,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleService.deleteSchedule(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: result,
  });
});

const getAllSchedule = catchAsync(async (req: Request, res: Response) => {
  const { page, limit,startDate,endDate } = req.query;
  const result = await scheduleService.getAllSchedule(Number(page || 1), Number(limit || 10),startDate as string,endDate as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const getMySchedule = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const result = await scheduleService.getMySchedule(req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const deleteMyScheduleById = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { ids } = req.body;
  const result = await scheduleService.deleteMyScheduleById(ids, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: result,
  });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleService.getScheduleById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

export const scheduleController = {
  allSchedule,
  scheduleForDoctor,
  deleteSchedule,

  createSchedule,
  deleteAllSchedule,
  getAllSchedule,
  getMySchedule,
  deleteMyScheduleById,
  getScheduleById
};
