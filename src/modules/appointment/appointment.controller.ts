import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { Appointment, AppointmentStatus, PaymentStatus } from "@prisma/client";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.createAppointment(req.body, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment created successfully!",
    data: result,
  });
});

const myAppointments = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, status, paymentStatus, sortOrder } = req.query;
  const result = await AppointmentService.myAppointments(req.user as JwtPayload, Number(page || 1), Number(limit || 10), status as AppointmentStatus, paymentStatus as PaymentStatus, sortOrder as "asc" | "desc");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointments data fetched successfully",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.getAllAppointments();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointments data fetched successfully",
    data: result,
  });
})

const updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.updateAppointmentStatus(req.params.id, req.body.status,req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment status updated successfully!",
    data: result,
  });
});

export const AppointmentController = { createAppointment, myAppointments, getAllAppointments, updateAppointmentStatus };
