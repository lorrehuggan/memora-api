import { Hono } from "hono";
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: "http://localhost:8081",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
