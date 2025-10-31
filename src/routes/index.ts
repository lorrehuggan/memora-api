import { Hono } from "hono";

import auth from "./auth";
import health from "./health";

const routes = new Hono();

routes.route("/auth", auth);
routes.route("/health", health);

export { routes };
