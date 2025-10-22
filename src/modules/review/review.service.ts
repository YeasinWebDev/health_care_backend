import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../config/db";
import AppError from "../../helper/appError";
import { findManyWithFilters } from "../../helper/prismaHelper";

const createReview = async (user: JwtPayload, payload: any) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!patientData) {
    throw new AppError("Patient not found", 404);
  }
  const appointmentData = await prisma.appointment.findUnique({
    where: {
      id: payload.appointmentId,
    },
  });

  if (!appointmentData) {
    throw new AppError("Appointment not found", 404);
  }

  if (patientData.id !== appointmentData.patientId) {
    throw new AppError("You are not authorized to review this appointment", 403);
  }

  return await prisma.$transaction(async (tx) => {
    
    const review = await tx.review.create({
      data: {
        patientId: patientData.id,
        doctorId: appointmentData.doctorId,
        appointmentId: appointmentData.id,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const avgRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        avgRating: avgRating._avg.rating as number,
      },
    });

    return review;
  });
};

const getAllReviews = async (page: number, limit: number) => {
  return await findManyWithFilters(prisma.review, { page, limit });
};

export const ReviewService = { createReview , getAllReviews};
