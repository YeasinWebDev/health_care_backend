import { NextFunction, Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { JwtPayload } from "jsonwebtoken";

const createDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const result = await doctorScheduleService.createDoctorSchedule(req.body,req.user as JwtPayload);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Schedule created successfully!",
        data: result,
    });
}

const deleteDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const result = await doctorScheduleService.deleteDoctorSchedule(req.body,req.user as JwtPayload);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Schedule deleted successfully!",
        data: result,
    });
}

export const doctorScheduleController = {
    createDoctorSchedule,
    deleteDoctorSchedule
}