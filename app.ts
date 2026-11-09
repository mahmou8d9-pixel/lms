require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { ErrorMiddleware } from "./middleware/error";
import userRoute from "./routes/user.route";
import courseRoute from "./routes/course.route";
import orderRoute from "./routes/order.route";
import notificationRoute from "./routes/notification.route";
import analyticsRoute from "./routes/analytics.route";
import layoutRoute from "./routes/layout.route";

export const app = express();
app.set("trust proxy", 1);
// ── Body & Cookie parser ───────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// ── CORS ───────────────────────────────────────────────────────────────────
let allowedOrigins = [
  "http://localhost:3000",
  "https://front-lms-five.vercel.app",
];
if (process.env.ORIGIN) {
  try {
    if (process.env.ORIGIN.startsWith("[")) {
      allowedOrigins = JSON.parse(process.env.ORIGIN);
    } else {
      allowedOrigins = process.env.ORIGIN.split(",").map((o) => o.trim());
    }
  } catch {
    allowedOrigins = [process.env.ORIGIN];
  }
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Rate Limiter ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
app.use(limiter);

// ── Health check (instant response for container health probes) ───────────
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Healthy" });
});
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Healthy" });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use(
  "/api/v1",
  userRoute,
  courseRoute,
  orderRoute,
  notificationRoute,
  analyticsRoute,
  layoutRoute,
);

// ── Test route ─────────────────────────────────────────────────────────────
app.get("/test", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "hello world" });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use("*", (req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(ErrorMiddleware);
