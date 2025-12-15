import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../helper/appError";

const createPrescription = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { followUpDate, ...rest } = req.body;
  console.log(followUpDate, "followupDate")

  const parsedFollowupDate = followUpDate
    ? new Date(followUpDate)
    : undefined;

  if (parsedFollowupDate && isNaN(parsedFollowupDate.getTime())) {
    throw new AppError("Invalid follow-up date format", 400);
  }


  const result = await PrescriptionService.createPrescription(
    req.user as JwtPayload,
    {
      ...rest,
      followupDate: parsedFollowupDate,
    }
  );

  console.log(result)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Prescription created successfully!",
    data: result,
  });
});


const getMyPrescriptions = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { page, limit } = req.query;
  const result = await PrescriptionService.getMyPrescriptions(Number(page || 1), Number(limit || 10), req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Prescriptions data fetched successfully",
    data: result,
  });
});

export const PrescriptionController = { createPrescription, getMyPrescriptions };