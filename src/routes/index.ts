import { Hono } from "hono";

import auth from "./auth";
import health from "./health";
import reflections from "./reflections";

const routes = new Hono();

routes.route("/auth", auth);
routes.route("/health", health);
routes.route("/reflections", reflections);

export { routes };
