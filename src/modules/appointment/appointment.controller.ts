import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.createAppointment(req.body, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment created successfully!",
    data: result,
  });
});

export const AppointmentController = { createAppointment };
