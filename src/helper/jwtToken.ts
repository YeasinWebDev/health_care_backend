import jwt from "jsonwebtoken";

export const generateToken = ({ email, role }: { email: string; role: string }) => {
  const accessToken = jwt.sign({ email, role }, process.env.JWT_SECRET as string, { algorithm: "HS256", expiresIn: "1d" });

  const refreshToken = jwt.sign({ email, role }, process.env.JWT_SECRET as string, { algorithm: "HS256", expiresIn: "30d" });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET as string);
