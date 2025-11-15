import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

const entryStatus = pgEnum("entry_status", [
  "processing",
  "transcribing",
  "completed",
  "failed",
]);

export const toneLabelEnum = pgEnum("tone_label", [
  "calm",
  "confident",
  "curious",
  "uncertain",
  "stressed",
  "frustrated",
  "grateful",
  "excited",
  "tired",
  "reflective",
]);

export const entry = pgTable(
  "entry",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    filePath: text("file_path"),
    fileSize: integer("file_size"),
    fileDuration: integer("file_duration"),
    publicUrl: text("public_url"),
    bucket: text("bucket"),
    originalFileName: text("original_file_name"),
    language: text("language").notNull().default("en"),
    source: text("source_language").default("mobile"),
    audioURI: text("audio_uri"),
    audioDuration: integer(),
    prcocessingStatus: entryStatus("processing_status").default("processing"),
    transcript: text("transcript"),
    isPrivate: boolean("is_private").default(true),
  },
  table => [index("entry_user_id_idx").on(table.userId)]
);

export const entryTranscript = pgTable(
  "entry_transcript",
  {
    id: text("id").primaryKey(),
    entryId: text("entry_id")
      .notNull()
      .references(() => entry.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
    transcript: text("transcript"),
    language: text("language").notNull().default("en"),
    source: text("source_language").default("mobile"),
    confidence: numeric("confidence", {
      precision: 4,
      scale: 3,
    }).default("0"),
  },
  table => [index("entry_transcript_entry_id_idx").on(table.entryId)]
);

export const entryAnalysis = pgTable(
  "entry_analysis",
  {
    id: text("id").primaryKey(), // <-- text id

    entryId: text("entry_id")
      .notNull()
      .references(() => entry.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    /* Meta */
    language: text("language").notNull().default("en"),
    wordCount: integer("word_count").notNull().default(0),
    estimatedDurationSec: integer("estimated_duration_sec"),

    /* Mood */
    overallSentiment: numeric("overall_sentiment", { precision: 4, scale: 3 })
      .notNull()
      .default("0"),
    moodLabel: text("mood_label").notNull().default("neutral"),
    toneLabels: toneLabelEnum("tone_labels")
      .array()
      .notNull()
      .default(sql`ARRAY[]::tone_label[]`),
    moodEvidenceStartChar: integer("mood_evidence_start_char")
      .notNull()
      .default(0),
    moodEvidenceEndChar: integer("mood_evidence_end_char").notNull().default(0),

    /* (Optional legacy fields to match your earlier draft) */
    transcriptConf: numeric("transcript_conf", {
      precision: 4,
      scale: 3,
    }).default("0"),
    sentimentScore: numeric("sentiment_score", {
      precision: 4,
      scale: 3,
    }).default("0"),
  },
  t => [
    index("entry_analysis_entry_id_idx").on(t.entryId),
    index("entry_analysis_updated_idx").on(t.updatedAt),
  ]
);
