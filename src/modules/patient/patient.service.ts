import { Patient } from "@prisma/client";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../helper/appError";

const getAllPatients = async (
  page: number,
  limit: number,
  search: string,
  email: string,
  contactNumber: string,
  gender: string,
  sortBy?: keyof Patient,
  sortOrder?: "asc" | "desc"
) => {
  return await findManyWithFilters(prisma.patient, {
    page,
    limit,
    search,
    searchField: ["email", "name"],
    sortBy,
    sortOrder,
    filters: {
      ...(email ? { email } : {}),
      ...(contactNumber ? { contactNumber } : {}),
      ...(gender ? { gender } : {}),
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
};

const getSinglePatient = async (id: string) => {
  return await prisma.patient.findUnique({ where: { id } });
};

const updatePatient = async (user: JwtPayload, payload: any) => {
  const { medicalReport, patientHealthData, ...patient } = payload;
  const patientInfo = await prisma.patient.findUnique({ where: { email: user.email, isDeleted: false } });

  if (!patientInfo) {
    throw new AppError("Patient not found", 404);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.patient.update({ where: { id: patientInfo.id }, data: patient });

    if (patientHealthData) {
      await tx.patientHealthData.upsert({
        where: { patientId: patientInfo.id },
        update: { ...patientHealthData, dateOfBirth: new Date(patientHealthData.dateOfBirth) },
        create: {
          ...patientHealthData,
          patientId: patientInfo.id,
          dateOfBirth: new Date(patientHealthData.dateOfBirth),
        },
      });
    }

    if (medicalReport) {
      await tx.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: patientInfo.id,
        },
      });
    }

    return await tx.patient.findUnique({ where: { id: patientInfo.id }, include: { patientHealthData: true, medicalReport: true } });
  });
};
const deletePatient = async (id: string) => {
  return await prisma.patient.delete({ where: { id } });
};

const myPatientData = async (user: JwtPayload) => {
  const patientInfo = await prisma.patient.findUnique({ where: { email: user.email, isDeleted: false } });

  if (!patientInfo) {
    throw new AppError("Patient not found", 404);
  }
  return await prisma.patientHealthData.findUnique({ where: { patientId: patientInfo.id } });
};

export const PatientService = { getAllPatients, getSinglePatient, updatePatient, deletePatient, myPatientData };
