import { Hono } from "hono";

import { authMiddleware } from "@/middleware/auth";
import { corsMiddleware } from "@/middleware/cors";
import { errorHandler } from "@/middleware/error";
import { routes } from "@/routes/index";

const app = new Hono();

app.use("*", authMiddleware);
app.use(corsMiddleware);
app.route("/api", routes);
app.notFound(c => c.json({ message: "Not found" }, 404));
app.onError(errorHandler);

export default app;
