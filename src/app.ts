import express, { Application, Request, Response } from "express";
import cors from "cors";
import notFound from "./middlewares/notFound";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { userRouters } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";
import { scheduleRoutes } from "./modules/schedule/schedule.routes";
import { doctorScheduleRoutes } from "./modules/doctorSchedule/doctorSchedule.routes";
import { specialtiesRoutes } from "./modules/specialties/specialties.routes";
import { doctorRoutes } from "./modules/doctor/doctor.routes";
import { appointmentRoutes } from "./modules/appointment/appointment.routes";
import { PaymentController } from "./modules/payment/payment.controller";
import { prescriptionRoutes } from "./modules/prescription/prescription.routes";
import { reviewRouter } from "./modules/review/review.routes";
import { AppointmentService } from "./modules/appointment/appointment.service";
import cron from "node-cron";
import { metaRoutes } from "./modules/meta/meta.routes";
import { patientRoutes } from "./modules/patient/patient.routes";

const app: Application = express();

app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), PaymentController.checkWebhook);

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

// cron
// cron.schedule("* * * * *", () => {
//   try {
//     AppointmentService.cancelUnPaidAppointments();
//   } catch (error) {
//     console.log(error);
//   }
// });


// routes
app.use("/api/v1/user", userRouters);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/schedule", scheduleRoutes);
app.use("/api/v1/doctor-schedule", doctorScheduleRoutes);
app.use("/api/v1/specialties", specialtiesRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/appointment", appointmentRoutes);
app.use("/api/v1/prescription", prescriptionRoutes), 
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/meta", metaRoutes);
app.use("/api/v1/patient",patientRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph health care server..",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
