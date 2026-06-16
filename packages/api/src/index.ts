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

// CLIENT_URL may be a comma-separated list of allowed origins.
const allowedOrigins = CLIENT_URL.split(",").map((o) => o.trim()).filter(Boolean);

app.set("trust proxy", 1); // Render/Vercel run behind a proxy; needed for correct rate-limit IPs

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) and any whitelisted origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Rate-limit link creation: 20 requests per minute per IP
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please slow down", status: 429 } },
});

// Health check for Render
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
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
