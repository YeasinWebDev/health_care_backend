import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";
import { Doctor } from "@prisma/client";

const getAISuggestion = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAISuggestion(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI Suggestion fetched successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm:search, sortBy, sortOrder, email, specialties, contactNumber, gender, appointmentFee } = req.query;

  const result = await DoctorService.getAllFromDB(
    Number(page || 1),
    Number(limit || 10),
    search as string,
    email as string,
    specialties as string[],
    contactNumber as string,
    gender as string,
    appointmentFee as string,
    sortBy as keyof Doctor,
    sortOrder as "asc" | "desc"
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors data fetched successfully",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.updateDoctor(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully!",
    data: result,
  });
});

const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getSingleDoctor(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor data fetched successfully",
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.deleteDoctor(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully!",
    data: result,
  });
});

export const DoctorController = {getAISuggestion, getAllFromDB, updateDoctor, getSingleDoctor, deleteDoctor };
