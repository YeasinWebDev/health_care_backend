import { Doctor } from "@prisma/client";
import { prisma } from "../../config/db";
import { findManyWithFilters } from "../../helper/prismaHelper";
import AppError from "../../helper/appError";
import { IDoctorUpdateInput } from "./doctor.interface";
import { openai } from "../../config/openRouter";

export const getAISuggestion = async (payload: { symptoms: string }) => {
  if (!payload || !payload.symptoms) {
    throw new AppError("Please provide symptoms", 400);
  }

  // 1. Fetch all doctors with their specialties
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
    },
  });

  // 2. Extract specialties
  const specialties = doctors.flatMap((doctor) => doctor.doctorSpecialties.map((ds) => ds.specialities.title));

  const uniqueSpecialties = [...new Set(specialties)];

  // 3. Prompt for AI
  const prompt = `
The patient has the following symptoms:
"${payload.symptoms}"

Available medical specialties:
${uniqueSpecialties.join(", ")}

Based on the symptoms, suggest the most suitable medical specialty.
Also give a short explanation why this specialty fits.
Return the response in JSON format like:
{
  "recommendedSpecialty": "Specialty name",
  "reason": "Short explanation"
}
`;

  // 4. Call OpenRouter
  const response = await openai.chat.completions.create({
    model: "meta-llama/llama-3-8b-instruct",
    messages: [
      { role: "system", content: "You are a medical assistant helping match symptoms to specialties." },
      { role: "user", content: prompt },
    ],
  });

  let rawMessage = response.choices[0].message.content || "";

  // 5. Extract valid JSON part from message
  const jsonMatch = rawMessage.match(/\{[\s\S]*\}/);
  let suggestion: { recommendedSpecialty?: string; reason?: string } = {};

  try {
    if (jsonMatch) {
      suggestion = JSON.parse(jsonMatch[0]);
    } else {
      console.log(suggestion);
      // fallback if no JSON found
      throw new Error("No JSON found in AI response");
    }
  } catch (err) {
    console.log("AI Raw:", rawMessage);
    console.error("Parse error:", err);
    throw new AppError("Failed to parse AI response", 500);
  }

  // 6. Filter doctors
  const recommendedDoctors = doctors.filter((doctor) =>
    doctor.doctorSpecialties.some((ds) => ds.specialities.title.toLowerCase().includes(suggestion.recommendedSpecialty?.toLowerCase().trim() || ""))
  );

  return {
    aiSuggestion: suggestion,
    doctors: recommendedDoctors,
  };
};
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
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      review: true,
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

export const DoctorService = { getAISuggestion, getAllFromDB, updateDoctor, getSingleDoctor, deleteDoctor };
