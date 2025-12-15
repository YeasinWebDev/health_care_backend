import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../config/db";

const createDoctorSchedule = async (data: { scheduleIds: string[] }, user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!doctorData) {
    throw new Error("You are not a doctor");
  }

  //   check if all schedule ids are valid
  const schedules = await prisma.schedule.findMany({
    where: { id: { in: data.scheduleIds } },
  });

  if (schedules.length !== data.scheduleIds.length) {
    throw new Error("Some schedule IDs are invalid");
  }

  let ans = await prisma.doctorSchedule.createMany({
    data: data.scheduleIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId: scheduleId,
    })),
    skipDuplicates: true,
  });

  return ans;
};

const deleteDoctorSchedule = async (data: { scheduleIds: string[] }, user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!doctorData) {
    throw new Error("You are not a doctor");
  }

  //   check if all schedule ids are valid
  const schedules = await prisma.schedule.findMany({
    where: { id: { in: data.scheduleIds } },
  });

  if (schedules.length !== data.scheduleIds.length) {
    throw new Error("Some schedule IDs are invalid");
  }

  let ans = await prisma.doctorSchedule.deleteMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: data.scheduleIds,
      },
    },
  });

  return ans;
};

const mySchedule = async (user: JwtPayload, page: number, limit: number, isBooked: boolean) => {
  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!doctorData) {
    throw new Error("You are not a doctor");
  }

  const ans = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctorData.id,
      ...(isBooked ? { isBooked }: {}),
    },
    include: {
      schedule: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const meta= {
      total: ans.length,
      page,
      limit,
    }

  return {data: ans,meta};
};

export const doctorScheduleService = {
  createDoctorSchedule,
  deleteDoctorSchedule,
  mySchedule,
};
