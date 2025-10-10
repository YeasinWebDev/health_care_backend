import { Admin, Doctor, UserRole } from "@prisma/client";
import { prisma } from "../../config/db";
import { uploadToCloudinary } from "../../helper/fileUploder";
import { createPatientInput } from "./user.interface";
import bcrypt from "bcryptjs";

const createPatient = async (payload: createPatientInput, file: Express.Multer.File | undefined) => {
  if (file) {
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

const createAdmin = async (body:any,file: Express.Multer.File | undefined)=> {

  if(!body){
    throw new Error("Admin data is required");
  }

  if (file) {
    const uploadImage = await uploadToCloudinary(file);
    body.profilePhoto = uploadImage?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(body.password, 10);

  const userData = {
    email: body.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const adminData ={
    name: body.name,
    email: body.email,
    profilePhoto: body.profilePhoto,
    contactNumber: body.contactNumber
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: adminData,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (body:any,file: Express.Multer.File | undefined) => {

  if(!body){
    throw new Error("Doctor data is required");
  }

  if (file) {
    const uploadImage = await uploadToCloudinary(file);
    body.profilePhoto = uploadImage?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(body.password, 10);

  const userData = {
    email: body.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const doctorData ={
    name: body.name,
    email: body.email,
    profilePhoto: body.profilePhoto,
    contactNumber: body.contactNumber,
    address: body.address,
    registrationNumber: body.registrationNumber,
    experience: body.experience,
    gender: body.gender,
    appointmentFee: body.appointmentFee,
    qualification: body.qualification,
    currentWorkPlace: body.currentWorkPlace,
    designation: body.designation,
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: doctorData,
    });

    return createdDoctorData;
  });

  return result;
};

export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
};
