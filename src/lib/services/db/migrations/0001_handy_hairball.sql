ALTER TABLE "bauth"."sessions" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "bauth"."users" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "bauth"."session" DROP CONSTRAINT "sessions_token_unique";--> statement-breakpoint
ALTER TABLE "bauth"."user" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "bauth"."account" DROP CONSTRAINT "account_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bauth"."session" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bauth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "bauth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bauth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "bauth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bauth"."session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "bauth"."user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");