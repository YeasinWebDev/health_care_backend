import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

interface TokenPayload {
  email: string;
  role: string;
  expiry?: string | number;
}

export const generateToken = ({ email, role, expiry = "1d" }: TokenPayload) => {
  const secret = process.env.JWT_SECRET as Secret;
  
  const accessToken = jwt.sign(
    { email, role },
    secret,
    {
      algorithm: "HS256",
      expiresIn: expiry, 
    } as SignOptions
  );

  const refreshToken = jwt.sign(
    { email, role },
    secret,
    {
      algorithm: "HS256",
      expiresIn: "30d",
    } as SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET as Secret;
  return jwt.verify(token, secret) as JwtPayload;
};
