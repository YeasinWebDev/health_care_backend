import { Doctor } from "@prisma/client";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";
import AppError from "../../helper/appError";
import { IDoctorUpdateInput } from "./doctor.interface";

const getAllFromDB = async (
  page: number,
  limit: number,
  search: string,
  email: string,
  contactNumber: string,
  gender: string,
  appointmentFee: string,
  sortBy?: keyof Doctor,
  sortOrder?: "asc" | "desc"
) => {
  return await findManyWithFilters(prisma.doctor, {
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
      ...(appointmentFee ? { appointmentFee } : {}),
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
};

const updateDoctor = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!isDoctorExist) {
    return new AppError("Doctor not found", 400);
  }

  return await prisma.$transaction(async (tx) => {
    const { specialties, ...rest } = payload;

    // update specialties
    if (specialties) {
      await tx.doctorSpecialties.deleteMany({
        where: {
          doctorId: id,
        },
      });
      await tx.doctorSpecialties.createMany({
        data: specialties.map((speciality) => ({
          specialitiesId: speciality,
          doctorId: id,
        })),
      });
    }

    if (!isDoctorExist) {
      return new AppError("Doctor not found", 400);
    }

    // update doctor
    return await tx.doctor.update({
      where: {
        id,
      },
      data: rest,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });
  });
};

const getSingleDoctor = async (id: string) => {
  return await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
};

const deleteDoctor = async (id: string) => {
  return await prisma.doctor.delete({
    where: {
      id,
    },
  });
};

export const DoctorService = { getAllFromDB, updateDoctor, getSingleDoctor, deleteDoctor };
