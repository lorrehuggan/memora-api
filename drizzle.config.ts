import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined (drizzle.config.ts)");
}

export default defineConfig({
  out: "./src/lib/services/db/migrations",
  schema: "./src/lib/services/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
});
