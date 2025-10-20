import { AppointmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../helper/appError";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";

const createPrescription = async (user: JwtPayload, payload: Partial<Prescription>) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor!.email)) throw new AppError("This is not your appointment", 403);
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followupDate: payload.followupDate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const getMyPrescriptions = async (page: number, limit: number, user: JwtPayload) => {
  return await findManyWithFilters(prisma.prescription, {
    page,
    limit,
    sortOrder: "desc",
    filters: {
      patient: {
        email: user.email,
      },
    },
    include: {
      doctor: true,
    },
  });
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescriptions,
};
