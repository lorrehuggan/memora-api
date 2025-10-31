import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db/client";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async password => Bun.password.hash(password),
      verify: async ({ password, hash }) => Bun.password.verify(password, hash),
    },
    sendResetPassword: async ({ user, url, token }, _request) => {
      // TODO: Implement email sending logic
      // For now, log the reset URL (replace with actual email service)
      // eslint-disable-next-line no-console
      console.log(`Password reset for ${user.email}: ${url}`);
      // eslint-disable-next-line no-console
      console.log(`Reset token: ${token}`);

      // Return a promise to satisfy async requirement
      return Promise.resolve();
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cache: 5 * 60 * 1000,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
});
