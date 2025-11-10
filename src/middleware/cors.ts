import { Hono } from "hono";
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: [
    "http://192.168.1.88:8081", // Expo dev server on your IP
  ],
  credentials: true,
});
