import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import linksRouter from "./routes/links";
import redirectRouter from "./routes/redirect";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/trim";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Rate-limit link creation: 20 requests per minute per IP
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please slow down", status: 429 } },
});

app.use("/api/links", createLimiter, linksRouter);
app.use("/", redirectRouter);

app.use(errorHandler);

async function start() {
  await connectDB(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Trim API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
