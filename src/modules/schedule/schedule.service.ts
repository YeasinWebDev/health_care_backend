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
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]) // 11:00
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]) // 11:00
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime; // 10:30
      const slotEndDateTime = addMinutes(startDateTime, intervalTime); // 11:00

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
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

      slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime);
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


const getAllSchedule = async (page: number, limit: number) => {
  const result = await findManyWithFilters(prisma.schedule, {
    page,
    limit
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

const deleteMyScheduleById = async (id: string[],user: JwtPayload) => {
  const isMySchedule = await prisma.doctorSchedule.findMany({
    where: {
      doctor:{
        email: user.email
      },
      scheduleId: {
        in: id
      }
    }
  })

  if(!isMySchedule.length) {
    throw new AppError("You are not allowed to delete this schedule", 403)
  }

  const result = await prisma.doctorSchedule.deleteMany({
    where: {
      doctor: {
        email: user.email
      },
      scheduleId: {
        in: id
      }
    }
  });
  return result;
}

export const scheduleService = {
  createSchedule,
  scheduleForDoctor,
  deleteSchedule,
  getAllSchedule,
  getMySchedule,
  deleteMyScheduleById
};
