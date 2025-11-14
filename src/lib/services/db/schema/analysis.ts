import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { entry, entryAnalysis } from "./entry";

// assumes entry.id is text

/* ===== Enums ===== */
export const entityKindEnum = pgEnum("entity_kind", [
  "person",
  "project",
  "place",
  "topic",
]);
export const highlightKindEnum = pgEnum("highlight_kind", ["quote"]);
export const redactionTypeEnum = pgEnum("redaction_type", [
  "person",
  "address",
  "contact",
  "payment",
  "location",
  "org",
]);
export const nudgeKindEnum = pgEnum("nudge_kind", ["loop_closer", "reframe"]);
export const arcStageEnum = pgEnum("arc_stage", [
  "beginning",
  "tension",
  "turning_point",
  "resolution",
]);

/* ===== Themes (≤3) ===== */
export const analysisTheme = pgTable(
  "analysis_theme",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    confidence: numeric("confidence", { precision: 3, scale: 2 })
      .notNull()
      .default("0.8"),
    support: jsonb("support")
      .$type<Array<{ startChar: number; endChar: number }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
  },
  t => [
    index("analysis_theme_analysis_idx").on(t.analysisId),
    index("analysis_theme_label_idx").on(t.label),
  ]
);

/* ===== Entities ===== */
export const analysisEntity = pgTable(
  "analysis_entity",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    kind: entityKindEnum("kind").notNull(),
    aliases: text("aliases")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    mentions: integer("mentions").notNull().default(1),
    avgSentiment: numeric("avg_sentiment", { precision: 4, scale: 3 })
      .notNull()
      .default("0"),
    firstSeenChar: integer("first_seen_char").notNull().default(0),
    lastSeenChar: integer("last_seen_char").notNull().default(0),
  },
  t => [
    index("analysis_entity_analysis_idx").on(t.analysisId),
    index("analysis_entity_unique_idx").on(t.analysisId, t.text),
  ]
);

/* ===== Relations (entity co-occurrence) ===== */
export const analysisRelation = pgTable(
  "analysis_relation",
  {
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    aEntityId: text("a_entity_id")
      .notNull()
      .references(() => analysisEntity.id, { onDelete: "cascade" }),
    bEntityId: text("b_entity_id")
      .notNull()
      .references(() => analysisEntity.id, { onDelete: "cascade" }),
    weight: numeric("weight", { precision: 3, scale: 2 })
      .notNull()
      .default("0.5"),
  },
  t => [
    primaryKey({
      columns: [t.analysisId, t.aEntityId, t.bEntityId],
      name: "analysis_relation_pk",
    }),
  ]
);

/* ===== Highlights (≤3) ===== */
export const analysisHighlight = pgTable(
  "analysis_highlight",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    kind: highlightKindEnum("kind").notNull().default("quote"),
    text: text("text").notNull(), // ≤ 140 chars (enforce in app layer)
    startChar: integer("start_char").notNull(),
    endChar: integer("end_char").notNull(),
    startMs: integer("start_ms"),
    endMs: integer("end_ms"),

    salience: numeric("salience", { precision: 3, scale: 2 })
      .notNull()
      .default("0.8"),
    quotability: numeric("quotability", { precision: 3, scale: 2 })
      .notNull()
      .default("0.8"),
    emotionIntensity: numeric("emotion_intensity", { precision: 3, scale: 2 })
      .notNull()
      .default("0.4"),
  },
  t => [index("analysis_highlight_analysis_idx").on(t.analysisId)]
);

/* ===== Follow-ups (≤3) ===== */
export const analysisFollowUp = pgTable(
  "analysis_follow_up",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    why: text("why"),
    dueSuggestion: text("due_suggestion"),
    sourceStartChar: integer("source_start_char").notNull(),
    sourceEndChar: integer("source_end_char").notNull(),
    confidence: numeric("confidence", { precision: 3, scale: 2 })
      .notNull()
      .default("0.85"),
  },
  t => [index("analysis_follow_up_analysis_idx").on(t.analysisId)]
);

/* ===== Questions user asked ===== */
export const analysisQuestion = pgTable(
  "analysis_question",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    startChar: integer("start_char").notNull(),
    endChar: integer("end_char").notNull(),
  },
  t => [index("analysis_question_analysis_idx").on(t.analysisId)]
);

/* ===== Digest snapshot (per entry) ===== */
export const analysisDigest = pgTable("analysis_digest", {
  analysisId: text("analysis_id")
    .primaryKey()
    .references(() => entryAnalysis.id, { onDelete: "cascade" }),
  topMoments: text("top_moments")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  themes: text("themes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  quoteOfDay: text("quote_of_day"),
  tomorrowCues: text("tomorrow_cues")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

/* ===== QA chunks (2–4) ===== */
export const analysisQaChunk = pgTable(
  "analysis_qa_chunk",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    text: text("text").notNull(), // verbatim excerpt 200–600 chars
    startChar: integer("start_char").notNull(),
    endChar: integer("end_char").notNull(),
    keywords: text("keywords")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
  },
  t => [index("analysis_qa_chunk_analysis_idx").on(t.analysisId)]
);

/* ===== Redaction candidates ===== */
export const analysisRedaction = pgTable(
  "analysis_redaction",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    type: redactionTypeEnum("type").notNull(),
    text: text("text").notNull(),
    startChar: integer("start_char").notNull(),
    endChar: integer("end_char").notNull(),
  },
  t => [
    index("analysis_redaction_analysis_idx").on(t.analysisId),
    index("analysis_redaction_type_idx").on(t.type),
  ]
);

/* ===== Nudge suggestions ===== */
export const analysisNudge = pgTable(
  "analysis_nudge",
  {
    id: text("id").primaryKey(), // <-- text id
    analysisId: text("analysis_id")
      .notNull()
      .references(() => entryAnalysis.id, { onDelete: "cascade" }),
    kind: nudgeKindEnum("kind").notNull(),
    text: text("text").notNull(),
  },
  t => [index("analysis_nudge_analysis_idx").on(t.analysisId)]
);

/* ===== Arc signals (1:1 with analysis) ===== */
export const analysisArc = pgTable("analysis_arc", {
  analysisId: text("analysis_id")
    .primaryKey()
    .references(() => entryAnalysis.id, { onDelete: "cascade" }),
  stage: arcStageEnum("stage"),
  rationale: text("rationale"),
});
