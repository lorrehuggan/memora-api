// Primitive enums/unions
export type ToneLabel =
  | "calm"
  | "confident"
  | "curious"
  | "uncertain"
  | "stressed"
  | "frustrated"
  | "grateful"
  | "excited"
  | "tired"
  | "reflective";

export type EntityKind = "person" | "project" | "place" | "topic";

export type HighlightKind = "quote";

export type RedactionType =
  | "person"
  | "address"
  | "contact"
  | "payment"
  | "location"
  | "org";

export type NudgeKind = "loop_closer" | "reframe";

export type ArcStage =
  | "beginning"
  | "tension"
  | "turning_point"
  | "resolution"
  | null;

export interface EvidenceCharSpan {
  startChar: number;
  endChar: number;
}

export interface EvidenceSegSpan {
  startSec: number;
  endSec: number;
}

export interface ScoresObject {
  salience: number;
  quotability: number;
  emotionIntensity: number;
}

// Root payload
export interface AnalyserOutput {
  meta: {
    language: string; // BCP-47 (e.g., "en")
    wordCount: number;
    estimatedDurationSec: number | null;
  };

  mood: {
    overallSentiment: number; // -1..1
    moodLabel: string; // e.g., "neutral", "balanced"
    toneLabels: ToneLabel[]; // ≤ 3 items
    // Support both object and separate properties
    evidence?: EvidenceCharSpan;
    evidenceStartChar?: number;
    evidenceEndChar?: number;
  };

  themes: Array<{
    id?: string; // Optional for input, required for output
    label: string; // short noun phrase
    support: EvidenceCharSpan[]; // evidence spans in transcript
    confidence: number; // 0..1
  }>;

  entities: Array<{
    id?: string; // Optional for input, required for output
    text: string;
    kind: EntityKind;
    aliases: string[];
    mentions: number;
    avgSentiment: number; // -1..1
    firstSeenChar: number;
    lastSeenChar: number;
  }>;

  relations: Array<{
    // Support both naming conventions
    a?: string;
    b?: string;
    aEntityId?: string;
    bEntityId?: string;
    weight: number; // 0..1 co-occurrence strength
  }>;

  highlights: Array<{
    id?: string; // Optional for input, required for output
    kind: HighlightKind; // "quote"
    text: string; // ≤ 140 chars
    startChar: number;
    endChar: number;
    // Support both naming conventions
    startSec?: number;
    endSec?: number;
    startMs?: number;
    endMs?: number;
    // Support both direct and nested properties
    scores?: ScoresObject;
    salience?: number;
    quotability?: number;
    emotionIntensity?: number;
  }>;

  followUps: Array<{
    id?: string; // Optional for input, required for output
    title: string; // verb-led actionable
    why: string | null; // rationale, nullable to match database
    dueSuggestion: string | null; // natural phrase ("tomorrow morning")
    // Support both object and separate properties
    source?: EvidenceCharSpan;
    sourceStartChar?: number;
    sourceEndChar?: number;
    confidence: number; // 0..1
  }>;

  questionsUserAsked: Array<{
    id?: string; // Optional for input, required for output
    text: string;
    startChar: number;
    endChar: number;
  }>;

  digest: {
    topMoments: string[]; // 1–N one-liners
    themes: string[]; // labels only
    quoteOfDay: string | null; // short quote, nullable to match database
    tomorrowCues: string[]; // action cues
  };

  qaChunks: Array<{
    id?: string; // Optional for input, required for output
    summary: string; // 1-line gist
    text: string; // 200–600 chars verbatim excerpt
    startChar: number;
    endChar: number;
    keywords: string[]; // 3–7 items
  }>;

  redactionCandidates: Array<{
    id?: string; // Optional for input, required for output
    type: RedactionType;
    text: string; // verbatim sensitive token
    startChar: number;
    endChar: number;
  }>;

  nudgeSuggestions: Array<{
    id?: string; // Optional for input, required for output
    kind: NudgeKind;
    text: string; // concise suggestion
  }>;

  arcSignals: {
    stage: ArcStage;
    rationale: string | null;
  };
}

// Add database-specific types for schema compatibility
export interface DbAnalysisRecord {
  id: string;
  entryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  language: string;
  wordCount: number;
  estimatedDurationSec: number | null;
  overallSentiment: number;
  moodLabel: string;
  toneLabels: ToneLabel[];
  moodEvidenceStartChar: number;
  moodEvidenceEndChar: number;
  transcriptConf: number | null;
  sentimentScore: number | null;
}

export type CreateEntryParams = {
  userId: string;
  title?: string;
  description?: string;
  filePath: string;
  publicUrl: string;
  bucket?: string;
  originalFileName: string;
  fileSize?: number;
  fileMimeType?: string;
  fileDuration?: number;
  participantCount?: number;
  tags?: string[];
};

export type CreateEntryTranscriptParams = {
  entryId: string;
  transcript: string;
};
