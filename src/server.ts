import app from "./app";
import { prisma } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  try {
    await prisma.$connect();
    console.log("*** DB connection successful!!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("*** Failed to start server", error);
    process.exit(1);
  }
}

startServer();

export default app;
