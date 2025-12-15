import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PatientService } from "./patient.service";
import { Patient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, email, contactNumber, gender, sortBy, sortOrder } = req.query;
  const result = await PatientService.getAllPatients(
    Number(page || 1),
    Number(limit || 10),
    search as string,
    email as string,
    contactNumber as string,
    gender as string,
    sortBy as keyof Patient,
    sortOrder as "asc" | "desc"
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient data fetched successfully",
    data: result,
  });
});


const getSinglePatient = catchAsync(async (req: Request, res: Response) => {
  const result = await PatientService.getSinglePatient(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient data fetched successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const result = await PatientService.updatePatient(req.user as JwtPayload, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient updated successfully!",
    data: result,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const result = await PatientService.deletePatient(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully!",
    data: result,
  });
});

export const PatientController = { getAllPatients, getSinglePatient, updatePatient, deletePatient };