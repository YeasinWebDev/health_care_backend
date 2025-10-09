import { prisma } from "../../config/db";
import { uploadToCloudinary } from "../../helper/fileUploder";
import { createPatientInput } from "./user.interface";
import bcrypt from "bcryptjs";

const createPatient = async (payload: createPatientInput, file: Express.Multer.File | undefined) => {

  if(file){
    const uploadImage = await uploadToCloudinary(file);
    payload = {
      ...payload,
      profilePhoto: uploadImage?.secure_url,
    };
  }

  const isUserExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExist) {
    throw new Error("User already exist!");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
      },
    });
    let patient = await tx.patient.create({
      data: {
        name: payload.name,
        email: payload.email,
        address: payload.address,
        gender: payload.gender,
        profilePhoto: payload.profilePhoto,
      },
    });

    return { user, patient };
  });

  return result;
};

export const userService = {
  createPatient,
};
