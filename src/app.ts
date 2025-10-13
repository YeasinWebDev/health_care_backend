import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import notFound from "./middlewares/notFound";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { userRouters } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";
import { scheduleRoutes } from "./modules/schedule/schedule.routes";
import { doctorScheduleRoutes } from "./modules/doctorSchedule/doctorSchedule.routes";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.use("/api/v1/user", userRouters);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/schedule", scheduleRoutes);
app.use("/api/v1/doctor-schedule", doctorScheduleRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph health care server..",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
