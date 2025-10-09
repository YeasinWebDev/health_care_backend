import app from "./app";
import { prisma } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

async function connectToDB() {
  try {
    await prisma.$connect();
    console.log("*** DB connection successful!!");
  } catch (error) {
    console.error("*** DB connection failed!", error);
  }
}

connectToDB();

// ✅ Local development only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Server running locally on port ${port}`);
  });
}

export default app;
