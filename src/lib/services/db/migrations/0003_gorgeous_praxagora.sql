CREATE TYPE "public"."arc_stage" AS ENUM('beginning', 'tension', 'turning_point', 'resolution');--> statement-breakpoint
CREATE TYPE "public"."entity_kind" AS ENUM('person', 'project', 'place', 'topic');--> statement-breakpoint
CREATE TYPE "public"."highlight_kind" AS ENUM('quote');--> statement-breakpoint
CREATE TYPE "public"."nudge_kind" AS ENUM('loop_closer', 'reframe');--> statement-breakpoint
CREATE TYPE "public"."redaction_type" AS ENUM('person', 'address', 'contact', 'payment', 'location', 'org');--> statement-breakpoint
CREATE TYPE "public"."tone_label" AS ENUM('calm', 'confident', 'curious', 'uncertain', 'stressed', 'frustrated', 'grateful', 'excited', 'tired', 'reflective');--> statement-breakpoint
CREATE TABLE "analysis_arc" (
	"analysis_id" text PRIMARY KEY NOT NULL,
	"stage" "arc_stage",
	"rationale" text
);
--> statement-breakpoint
CREATE TABLE "analysis_digest" (
	"analysis_id" text PRIMARY KEY NOT NULL,
	"top_moments" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"themes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"quote_of_day" text,
	"tomorrow_cues" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_entity" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"text" text NOT NULL,
	"kind" "entity_kind" NOT NULL,
	"aliases" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"mentions" integer DEFAULT 1 NOT NULL,
	"avg_sentiment" numeric(4, 3) DEFAULT '0' NOT NULL,
	"first_seen_char" integer DEFAULT 0 NOT NULL,
	"last_seen_char" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_follow_up" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"title" text NOT NULL,
	"why" text,
	"due_suggestion" text,
	"source_start_char" integer NOT NULL,
	"source_end_char" integer NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.85' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_highlight" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"kind" "highlight_kind" DEFAULT 'quote' NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"start_ms" integer,
	"end_ms" integer,
	"salience" numeric(3, 2) DEFAULT '0.8' NOT NULL,
	"quotability" numeric(3, 2) DEFAULT '0.8' NOT NULL,
	"emotion_intensity" numeric(3, 2) DEFAULT '0.4' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_nudge" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"kind" "nudge_kind" NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_qa_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"summary" text NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"keywords" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_question" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_redaction" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"type" "redaction_type" NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_relation" (
	"analysis_id" text NOT NULL,
	"a_entity_id" text NOT NULL,
	"b_entity_id" text NOT NULL,
	"weight" numeric(3, 2) DEFAULT '0.5' NOT NULL,
	CONSTRAINT "analysis_relation_pk" PRIMARY KEY("analysis_id","a_entity_id","b_entity_id")
);
--> statement-breakpoint
CREATE TABLE "analysis_theme" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_id" text NOT NULL,
	"label" text NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.8' NOT NULL,
	"support" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entry_analysis" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "entry_analysis" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "entry_analysis" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "entry_analysis" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "entry_analysis" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "word_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "estimated_duration_sec" integer;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "overall_sentiment" numeric(4, 3) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "mood_label" text DEFAULT 'neutral' NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "tone_labels" "tone_label"[] DEFAULT ARRAY[]::tone_label[] NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "mood_evidence_start_char" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_analysis" ADD COLUMN "mood_evidence_end_char" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analysis_arc" ADD CONSTRAINT "analysis_arc_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_digest" ADD CONSTRAINT "analysis_digest_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_entity" ADD CONSTRAINT "analysis_entity_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_follow_up" ADD CONSTRAINT "analysis_follow_up_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_highlight" ADD CONSTRAINT "analysis_highlight_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_nudge" ADD CONSTRAINT "analysis_nudge_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_qa_chunk" ADD CONSTRAINT "analysis_qa_chunk_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_question" ADD CONSTRAINT "analysis_question_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_redaction" ADD CONSTRAINT "analysis_redaction_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_relation" ADD CONSTRAINT "analysis_relation_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_relation" ADD CONSTRAINT "analysis_relation_a_entity_id_analysis_entity_id_fk" FOREIGN KEY ("a_entity_id") REFERENCES "public"."analysis_entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_relation" ADD CONSTRAINT "analysis_relation_b_entity_id_analysis_entity_id_fk" FOREIGN KEY ("b_entity_id") REFERENCES "public"."analysis_entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_theme" ADD CONSTRAINT "analysis_theme_analysis_id_entry_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."entry_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_entity_analysis_idx" ON "analysis_entity" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_entity_unique_idx" ON "analysis_entity" USING btree ("analysis_id","text");--> statement-breakpoint
CREATE INDEX "analysis_follow_up_analysis_idx" ON "analysis_follow_up" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_highlight_analysis_idx" ON "analysis_highlight" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_nudge_analysis_idx" ON "analysis_nudge" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_qa_chunk_analysis_idx" ON "analysis_qa_chunk" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_question_analysis_idx" ON "analysis_question" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_redaction_analysis_idx" ON "analysis_redaction" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_redaction_type_idx" ON "analysis_redaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "analysis_theme_analysis_idx" ON "analysis_theme" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "analysis_theme_label_idx" ON "analysis_theme" USING btree ("label");--> statement-breakpoint
CREATE INDEX "entry_analysis_updated_idx" ON "entry_analysis" USING btree ("updated_at");--> statement-breakpoint
ALTER TABLE "entry_analysis" DROP COLUMN "mood";--> statement-breakpoint
ALTER TABLE "entry_analysis" DROP COLUMN "tone";