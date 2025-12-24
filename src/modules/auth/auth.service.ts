import { UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../../helper/jwtToken";
import AppError from "../../helper/appError";
import emailSender from "./emailSender";
import { JwtPayload } from "jsonwebtoken";

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
  console.log(userData,"userData")

  const resetPassToken = generateToken({ email: userData.email, role: userData.role, expiry: "10m" });
  console.log(resetPassToken, 'token')

  const resetPassLink = process.env.reset_pass_link + `?userId=${userData.id}&email=${encodeURIComponent(userData.email)}&token=${resetPassToken.accessToken}`;

  await emailSender(
    userData.email,
    `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">PH Health Care</h1>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        Hello,
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        We received a request to reset your password for your PH Health Care account. Click the button below to create a new password:
                                    </p>
                                    <!-- Button -->
                                    <table role="presentation" style="margin: 0 auto;">
                                        <tr>
                                            <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                                <a href="${resetPassLink}" style="border: none; color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block; border-radius: 6px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 20px;">
                                        Or copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #667eea; font-size: 14px; line-height: 20px; word-break: break-all;">
                                        ${resetPassLink}
                                    </p>
                                    <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 20px;">
                                            <strong>Security Notice:</strong>
                                        </p>
                                        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #999999; font-size: 14px; line-height: 20px;">
                                            <li>This link will expire in 15 minutes</li>
                                            <li>If you didn't request this password reset, please ignore this email</li>
                                            <li>For security reasons, never share this link with anyone</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                                        © ${new Date().getFullYear()} PH Health Care. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #999999; font-size: 12px;">
                                        This is an automated email. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
  );
};

const resetPassword = async (token: string | null, payload: { email?: string; password: string }, user?: JwtPayload) => {
  let userEmail: string;

  // Case 1: Token-based reset (from forgot password email)
  if (token) {
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      throw new AppError("Invalid or expired reset token!", 400);
    }

    // Verify email from token matches the email in payload
    if (payload.email && decodedToken.email !== payload.email) {
      throw new AppError("Email mismatch! Invalid reset request.", 400);
    }

    userEmail = decodedToken.email;
  }
  // Case 2: Authenticated user with needPasswordChange (newly created admin/doctor)
  else if (user && user.email) {
    console.log({ user }, "needpassworchange");
    const authenticatedUser = await prisma.user.findUniqueOrThrow({
      where: {
        email: user.email,
        status: UserStatus.ACTIVE,
      },
    });

    // Verify user actually needs password change
    if (!authenticatedUser.needPasswordChange) {
      throw new AppError("You don't need to reset your password. Use change password instead.", 400);
    }

    userEmail = user.email;
  } else {
    throw new AppError("Invalid request. Either provide a valid token or be authenticated.", 400);
  }

  // hash password
  const password = await bcrypt.hash(payload.password, Number(10));

  // update into database
  await prisma.user.update({
    where: {
      email: userEmail,
    },
    data: {
      password,
      needPasswordChange: false,
    },
  });
};

const getMe = async (session: { accessToken: string }) => {
  console.log(session, "session");
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

  const { password, ...rest } = userData;

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
