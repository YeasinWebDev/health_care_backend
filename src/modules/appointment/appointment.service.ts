import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../config/db";
import { v4 as uuid } from "uuid";
import AppError from "../../helper/appError";
import { stripe } from "../../helper/stripe";
import { findManyWithFilters } from "../../helper/prismaHelper";
import { AppointmentStatus, PaymentStatus, UserRole } from "@prisma/client";

const createAppointment = async (payload: { doctorId: string; scheduleId: string }, user: JwtPayload) => {
  console.log(payload);
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

    return { appointmentData, transactionData };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with doctor ${doctorData.name}`,
            description: `Payment for appointment ${result.appointmentData.id}`,
          },
          unit_amount: doctorData.appointmentFee * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: result.appointmentData.id.toString(),
      paymentId: result.transactionData.id.toString(),
    },
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
  });

  return { result, paymentUrl: session.url };
};

const myAppointments = async (user: JwtPayload, page: number, limit: number, status: AppointmentStatus, paymentStatus: PaymentStatus, sortOrder: "asc" | "desc") => {
  const userFilter = user.role === UserRole.PATIENT ? { patient: { email: user.email } } : { doctor: { email: user.email } };

  const result = await findManyWithFilters(prisma.appointment, {
    page,
    limit,
    sortOrder,
    filters: {
      ...userFilter,
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    },
    include:
      user.role === UserRole.PATIENT
        ? { doctor: true, schedule: true, payment: true, Review: true }
        : { patient: true, schedule: true, payment: true, prescription: true, Review: true },
    // include:
    //   user.role === UserRole.PATIENT
    //     ? { doctor: true, schedule: true, review: true, prescription: true, payment: true }
    //     : { patient: { include: { medicalReports: true, patientHealthData: true } }, schedule: true, payment: true, prescription: true, review: true },
  });
  console.log(result);

  return result;
};

// task get all data from db for admin
const getAllAppointments = async () => {
  return await findManyWithFilters(prisma.appointment, {});
};

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: JwtPayload) => {
  const isAppointmentExist = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!isAppointmentExist) {
    throw new AppError("Appointment not found", 404);
  }

  if (user.role === UserRole.DOCTOR) {
    if (user.email !== isAppointmentExist.doctor!.email) {
      throw new AppError("You are not authorized to update this appointment", 403);
    } else {
      return await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          status,
        },
      });
    }
  }
};

const cancelUnPaidAppointments = async () => {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      paymentStatus: PaymentStatus.UNPAID,
      createdAt: { lt: tenMinAgo },
    },
  });
  const appointmentIds = unPaidAppointments.map((appointment) => appointment.id);

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: { in: appointmentIds },
      },
    });
    await tx.appointment.deleteMany({
      where: {
        id: { in: appointmentIds },
      },
    });

    for (const appointment of unPaidAppointments) {
      await tx.doctorSchedule.update({
        where: {
          doctorId_scheduleId: {
            doctorId: appointment.doctorId,
            scheduleId: appointment.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

const createAppointmentWithPayLater = async (user: JwtPayload, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuid();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tnx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuid();

    await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  return result;
};

const initiatePaymentForAppointment = async (appointmentId: string, user: JwtPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      payment: true,
      doctor: true,
    },
  });

  if (!appointment) {
    throw new AppError("Appointment not found or unauthorized",400);
  }

  if (appointment.paymentStatus !== PaymentStatus.UNPAID) {
    throw new AppError("Payment already completed for this appointment",400);
  }

  if (appointment.status === AppointmentStatus.CANCEL) {
    throw new AppError("Cannot pay for cancelled appointment",400);
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user?.email || "",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with ${appointment?.doctor!.name}`,
          },
          unit_amount: appointment.payment!.amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment.id,
      paymentId: appointment.payment!.id,
    },
    success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/my-appointments`,
  });

  return { paymentUrl: session.url };
};

export const AppointmentService = { createAppointment, myAppointments, getAllAppointments, updateAppointmentStatus, cancelUnPaidAppointments , createAppointmentWithPayLater, initiatePaymentForAppointment };
