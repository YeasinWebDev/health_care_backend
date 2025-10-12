import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helper/jwtToken";
import { JwtPayload } from "jsonwebtoken";

export const auth = (...roles: string[]) => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      const verifyUser = await verifyToken(token);

      if (!verifyUser) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      req.user = verifyUser;

      if (roles.includes((verifyUser as JwtPayload).role as string)) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have access",
        });
      }
    } catch (error) {
      next(error);
    }
  };
};
