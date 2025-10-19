import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../config/db";
import { v4 as uuid } from "uuid";
import AppError from "../../helper/appError";

const createAppointment = async (payload: { doctorId: string; scheduleId: string }, user: JwtPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.doctorSchedule.findFirst({
    where: {
      scheduleId: payload.scheduleId,
      doctorId: payload.doctorId,
      isBooked: false,
    },
  });

  if (!scheduleData) {
    throw new AppError("Schedule is not available", 400);
  }

  const videoCallingId = uuid();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: scheduleData.scheduleId,
        videoCallingId: videoCallingId,
      },
    });

    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuid();
    const transactionData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId: transactionId,
      },
    });

    return {appointmentData, transactionData};
  });

  return result;
};

export const AppointmentService = { createAppointment };
