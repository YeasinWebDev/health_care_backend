import { Gender } from "@prisma/client";
import z from "zod";

export const createZodPatientSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.email({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  address: z.string().nonempty({ message: "Address is required" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
});

export const createAdminValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  name: z.string({
    error: "Name is required!",
  }),
  email: z.string({
    error: "Email is required!",
  }),
  contactNumber: z.string({
    error: "Contact Number is required!",
  }),
  address: z.string().optional(),
});

export const createDoctorValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  name: z.string({
    error: "Name is required!",
  }),
  email: z.string({
    error: "Email is required!",
  }),
  contactNumber: z.string({ 
    error: "Contact Number is required!",
  }),
  address: z.string({
    error: "Address is required!",
  }),
  registrationNumber: z.string({
    error: "Reg number is required",
  }),
  experience: z.number({
    error: "Experience is required",
  }),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  appointmentFee: z.number({
    error: "appointment fee is required",
  }),
  qualification: z.string({
    error: "qualification is required",
  }),
  currentWorkPlace: z.string({
    error: "Current working place is required!",
  }),
  designation: z.string({
    error: "Designation is required!",
  }),
  specialties: z.array(z.string(), {
    error: "Specialties is required!",
  }),
});
