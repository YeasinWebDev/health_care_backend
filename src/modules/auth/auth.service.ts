import { UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../../helper/jwtToken";
import AppError from "../../helper/appError";
import emailSender from "./emailSender";

const login = async (payload: any) => {
  const result = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!result) {
    throw new AppError("User not found!", 400);
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, result?.password as string);

  if (!isPasswordMatch) {
    throw new AppError("Invalid password!", 400);
  }

  const token = generateToken({ email: result?.email as string, role: result?.role as string });

  const { password, ...rest } = result;

  return { token, user: rest };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token);
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

   const tokenObj = generateToken({
    email: userData.email,
    role: userData.role,
  });
  

  return {
    tokenObj,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(13));

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = generateToken({ email: userData.email, role: userData.role, expiry: "5m" });

  const resetPassLink = process.env.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender(
    userData.email,
    `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>
            <p>This mail will be expired in 5 minutes.</p> 
            <p>Thanks</p>
            <p>Team PH Health Care</p>
        </div>
        `
  );
};

const resetPassword = async (token: string, payload: { id: string; newPassword: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = verifyToken(token);

  if (!isValidToken) {
    throw new AppError("Invalid token!", 400);
  }

  // hash password
  const password = await bcrypt.hash(payload.newPassword, Number(13));

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
      needPasswordChange: false,
    },
  });
};

const getMe = async (session: { accessToken: string }) => {
  console.log(session,"session")
  const accessToken = session.accessToken;
  const decodedData = verifyToken(accessToken);

  if (!decodedData) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const { password , ...rest } = userData;

  return {
    ...rest,
  };
};

export const authService = {
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
