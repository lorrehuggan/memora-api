import { Hono } from "hono";

import { auth } from "@/services/auth";

const health = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

health.get("/", c => c.json({ status: "ok" }));

health.get("/auth", c => {
  console.log("ping");
  const session = c.get("session");
  console.log("session", session);
  return c.json({ message: "testing" });
});

export default health;
