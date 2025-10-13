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

export const doctorScheduleService = {
  createDoctorSchedule,
};
