import { NextFunction, Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { JwtPayload } from "jsonwebtoken";

const createDoctorSchedule = async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
  const result = await doctorScheduleService.createDoctorSchedule(req.body, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
};

const deleteDoctorSchedule = async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
  const result = await doctorScheduleService.deleteDoctorSchedule(req.body, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: result,
  });
};

const mySchedule = async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
  const { page, limit, isBooked} = req.query;

  const result = await doctorScheduleService.mySchedule(req.user as JwtPayload, Number(page || 1), Number(limit || 10), isBooked === "true");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: result,
  });
};

export const doctorScheduleController = {
  createDoctorSchedule,
  deleteDoctorSchedule,
  mySchedule
};
