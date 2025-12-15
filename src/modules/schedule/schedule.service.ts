import { addMinutes, addHours, format } from "date-fns";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../helper/appError";

interface ScheduleData {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

const createSchedule = async (data: ScheduleData) => {
  const { startTime, endTime, startDate, endDate } = data;

  const intervalTime = 30;
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const d = currentDate.getDate();

    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);

    let startDateTime = new Date(y, m, d, sH, sM);
    const endDateTime = new Date(y, m, d, eH, eM);

    while (startDateTime < endDateTime) {
      const slotStart = new Date(startDateTime);
      const slotEnd = new Date(startDateTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + intervalTime);

      const scheduleData = {
        startDateTime: slotStart,
        endDateTime: slotEnd,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};


const scheduleForDoctor = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc" | undefined,
  user: JwtPayload,
  startDateTime?: string,
  endDateTime?: string
) => {
  let filters: any = {};

  const doctorSchedule = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const scheduleIds = doctorSchedule.map((item) => item.scheduleId);

  // remove already assigned schedules
  if (scheduleIds.length > 0) {
    filters.id = { notIn: scheduleIds };
  }

  if (startDateTime && endDateTime) {
    const startDateObj = new Date(startDateTime);
    const endDateObj = new Date(endDateTime);

    // ✅ Only add date filter if both are valid
    if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
      filters.startDateTime = {
        gte: startDateObj,
        lte: endDateObj,
      };
    }
  }

  const result = await findManyWithFilters<{ id: string; startDateTime: Date; endDateTime: Date }, Prisma.ScheduleFindManyArgs, Prisma.ScheduleCountArgs>(prisma.schedule, {
    page,
    limit,
    sortBy: sortBy as any,
    sortOrder,
    filters,
  });

  return result;
};

const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.deleteMany({
    where: {
      id,
    },
  });
  return result;
};

const getAllSchedule = async (page: number, limit: number, startDate: string, endDate: string) => {
  const filters: any = {};
  if (startDate && endDate) {
  filters.AND = [
    { startDateTime: { gte: new Date(startDate) } },
    { endDateTime: { lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) } },
  ];
}

  const result = await findManyWithFilters(prisma.schedule, {
    page,
    limit,
    filters,
  });
  return result;
};

const getMySchedule = async (user: JwtPayload) => {
  const result = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    include: {
      schedule: true,
    },
  });
  return result;
};

const deleteMyScheduleById = async (id: string[], user: JwtPayload) => {
  const isMySchedule = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user.email,
      },
      scheduleId: {
        in: id,
      },
    },
  });

  if (!isMySchedule.length) {
    throw new AppError("You are not allowed to delete this schedule", 403);
  }

  const result = await prisma.doctorSchedule.deleteMany({
    where: {
      doctor: {
        email: user.email,
      },
      scheduleId: {
        in: id,
      },
    },
  });
  return result;
};

const getScheduleById = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const scheduleService = {
  createSchedule,
  scheduleForDoctor,
  deleteSchedule,
  getAllSchedule,
  getMySchedule,
  deleteMyScheduleById,
  getScheduleById
};
