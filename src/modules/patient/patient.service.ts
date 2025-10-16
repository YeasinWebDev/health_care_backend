import { Patient } from "@prisma/client";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";

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
    }
  });
};

const getSinglePatient = async (id: string) => {
  return await prisma.patient.findUnique({ where: { id } });
};

const updatePatient = async (id: string, payload: Partial<Patient>) => {
  return await prisma.patient.update({ where: { id }, data: payload });
};
const deletePatient = async (id: string) => {
  return await prisma.patient.delete({ where: { id } });
};

export const PatientService = { getAllPatients, getSinglePatient, updatePatient, deletePatient };
