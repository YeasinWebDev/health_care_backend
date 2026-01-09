import { Admin, Doctor, Patient, Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { uploadToCloudinary } from "../../helper/fileUploder";
import { createPatientInput } from "./user.interface";
import bcrypt from "bcryptjs";
import { findManyWithFilters } from "../../helper/prismaHelper";
import AppError from "../../helper/appError";
import { JwtPayload } from "jsonwebtoken";

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
    throw new AppError("User already exist", 400);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        needPasswordChange: false,
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

const createAdmin = async (body: any, file: Express.Multer.File | undefined) => {
  console.log(body, "body");
  if (!body) {
    return new AppError("Admin data is required", 400);
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

  const adminData = {
    name: body.name,
    email: body.email,
    profilePhoto: body.profilePhoto,
    contactNumber: body.contactNumber,
    address: body.address || "",
  };

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

const createDoctor = async (body: any, file: Express.Multer.File | undefined) => {
  if (!body) {
    throw new AppError("Doctor data is required", 400);
  }

  if (file) {
    const uploadImage = await uploadToCloudinary(file);
    body.profilePhoto = uploadImage?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const userData = {
    email: body.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const doctorData = {
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
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.create({ data: userData });

      const createdDoctor = await tx.doctor.create({
        data: doctorData,
      });

      await tx.doctorSpecialties.createMany({
        data: body.specialties.map((speciality: string) => ({
          specialitiesId: speciality,
          doctorId: createdDoctor.id,
        })),
      });

      return createdDoctor;
    });

    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Email already exists", 409);
    }

    throw error;
  }
};

const getallFromDB = async (page: number, limit: number, search: string, sortBy?: keyof User, sortOrder?: "asc" | "desc", role?: UserRole, status?: UserStatus) => {
  const result = await findManyWithFilters(prisma.user, {
    page,
    limit,
    search,
    searchField: ["email", "admin.name", "doctor.name", "patient.name"],
    sortBy,
    sortOrder,
    filters: {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      patient: true,
      doctor: true,
      admin: true,
    },
  });

  return result;
};

const me = async (user: JwtPayload) => {
  const result = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });
  const { password, ...rest } = result!;

  let roleData;

  if (rest.role === UserRole.DOCTOR) {
    roleData = await prisma.doctor.findUnique({
      where: {
        email: user.email,
      },
    });
  } else if (rest.role === UserRole.PATIENT) {
    roleData = await prisma.patient.findUnique({
      where: {
        email: user.email,
      },
    });
  } else if (rest.role === UserRole.ADMIN) {
    roleData = await prisma.admin.findUnique({
      where: {
        email: user.email,
      },
    });
  }

  return {
    ...rest,
    roleData,
  };
};

const changeProfileStatus = async (id: string, status: UserStatus) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError("User not found", 404);
  }

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateAdmin = async (id: string, body: Partial<Admin>) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError("Admin not found", 404);
  }
  const result = await prisma.admin.update({
    where: {
      email: isExist.email,
    },
    data: {
      name: body.name,
      email: body.email,
      contactNumber: body.contactNumber,
      address: body.address,
    },
  });

  return result;
};

const deleteAdmin = async (id: string) => {
  const res = await prisma.$transaction(async (transactionClient) => {
    const isExist = await transactionClient.user.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new Error("Admin not found!");
    }

    const result = await transactionClient.admin.delete({
      where: { email: isExist.email },
    });

    await transactionClient.user.delete({
      where: { id },
    });

    return result;
  });

  return res;
};

const updateMyProfie = async (user: JwtPayload, body: Partial<Admin> | Partial<Doctor> | Partial<Patient>, file: Express.Multer.File | undefined) => {
  if (!body) return null;

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (file) {
    const upload = await uploadToCloudinary(file);
    body.profilePhoto = upload?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: body as Admin,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: body as Doctor,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: body as Patient,
    });
  }

  return { ...profileInfo };
};

export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getallFromDB,
  me,
  changeProfileStatus,
  getUserById,
  updateAdmin,
  deleteAdmin,
  updateMyProfie,
};
