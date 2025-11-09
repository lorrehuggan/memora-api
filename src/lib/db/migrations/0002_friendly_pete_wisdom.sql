DO $$ BEGIN
 CREATE TYPE "public"."entry_status" AS ENUM('processing', 'transcribing', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE "entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"file_path" text,
	"file_size" integer,
	"file_duration" integer,
	"public_url" text,
	"bucket" text,
	"original_file_name" text,
	"language" text DEFAULT 'en' NOT NULL,
	"source_language" text DEFAULT 'mobile',
	"audio_uri" text,
	"audio_duration" integer,
	"processing_status" "entry_status" DEFAULT 'processing',
	"transcript" text,
	"is_private" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "entry_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"transcript_conf" numeric(4, 3) DEFAULT '0',
	"sentiment_score" numeric(4, 3) DEFAULT '0',
	"mood" text,
	"tone" text[] DEFAULT ARRAY[]::text[]
);
--> statement-breakpoint
CREATE TABLE "entry_transcript" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"transcript" text,
	"language" text DEFAULT 'en' NOT NULL,
	"source_language" text DEFAULT 'mobile',
	"confidence" numeric(4, 3) DEFAULT '0'
);
--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "bauth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD CONSTRAINT "entry_analysis_entry_id_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_transcript" ADD CONSTRAINT "entry_transcript_entry_id_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_user_id_idx" ON "entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "entry_analysis_entry_id_idx" ON "entry_analysis" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "entry_transcript_entry_id_idx" ON "entry_transcript" USING btree ("entry_id");
