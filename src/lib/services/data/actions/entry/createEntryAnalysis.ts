import { db } from "@/db/client";
import {
  analysisArc,
  analysisDigest,
  analysisEntity,
  analysisFollowUp,
  analysisHighlight,
  analysisNudge,
  analysisQaChunk,
  analysisQuestion,
  analysisRedaction,
  analysisRelation,
  analysisTheme,
} from "@/db/schema/analysis";
import { entryAnalysis } from "@/db/schema/entry";
import { generateSecureRandomString } from "@/lib/utils/generateSecureRandomString";
import { AnalyserOutput } from "@/types/reflections";

export const createEntryAnalysisAction = async (
  entryId: string,
  data: AnalyserOutput
) => {
  try {
    // Create analysis record and all related data in a transaction
    return await db.transaction(async trx => {
      // Create the main analysis record
      const [analysisRecord] = await trx
        .insert(entryAnalysis)
        .values({
          id: generateSecureRandomString(),
          entryId: entryId,
          createdAt: new Date(),
          updatedAt: new Date(),
          language: data.meta.language,
          wordCount: data.meta.wordCount,
          estimatedDurationSec: data.meta.estimatedDurationSec,
          overallSentiment: data.mood.overallSentiment.toString(),
          moodLabel: data.mood.moodLabel,
          toneLabels: data.mood.toneLabels,
          moodEvidenceStartChar:
            data.mood.evidenceStartChar ?? data.mood.evidence?.startChar ?? 0,
          moodEvidenceEndChar:
            data.mood.evidenceEndChar ?? data.mood.evidence?.endChar ?? 0,
        })
        .returning();

      // Process highlights individually to avoid array typing issues
      if (data.highlights && data.highlights.length > 0) {
        for (const highlight of data.highlights) {
          // Convert seconds to milliseconds if necessary
          const startMs =
            highlight.startMs ??
            (highlight.startSec !== undefined
              ? highlight.startSec * 1000
              : null);
          const endMs =
            highlight.endMs ??
            (highlight.endSec !== undefined ? highlight.endSec * 1000 : null);

          await trx.insert(analysisHighlight).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            kind: highlight.kind,
            text: highlight.text,
            startChar: highlight.startChar,
            endChar: highlight.endChar,
            startMs: startMs,
            endMs: endMs,
            // Use direct properties or nested scores object depending on what's available
            salience: (highlight.salience !== undefined
              ? highlight.salience
              : (highlight.scores?.salience ?? 0.8)
            ).toString(),
            quotability: (highlight.quotability !== undefined
              ? highlight.quotability
              : (highlight.scores?.quotability ?? 0.8)
            ).toString(),
            emotionIntensity: (highlight.emotionIntensity !== undefined
              ? highlight.emotionIntensity
              : (highlight.scores?.emotionIntensity ?? 0.4)
            ).toString(),
          });
        }
      }

      // Process themes individually
      if (data.themes && data.themes.length > 0) {
        for (const theme of data.themes) {
          await trx.insert(analysisTheme).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            label: theme.label,
            confidence: theme.confidence.toString(),
            support: theme.support,
          });
        }
      }

      // Create a map to store entity names to IDs
      const entityIdMap = new Map<string, string>();

      // Process entities individually
      if (data.entities && data.entities.length > 0) {
        for (const entity of data.entities) {
          const entityId = generateSecureRandomString();
          await trx.insert(analysisEntity).values({
            id: entityId,
            analysisId: analysisRecord.id,
            text: entity.text,
            kind: entity.kind,
            aliases: entity.aliases,
            mentions: entity.mentions,
            avgSentiment: entity.avgSentiment.toString(),
            firstSeenChar: entity.firstSeenChar,
            lastSeenChar: entity.lastSeenChar,
          });

          // Store the entity ID mapped to its text
          entityIdMap.set(entity.text, entityId);
        }
      }

      // Process relations individually
      if (data.relations && data.relations.length > 0) {
        for (const relation of data.relations) {
          // Get entity names/identifiers
          const aEntityName = relation.aEntityId ?? relation.a;
          const bEntityName = relation.bEntityId ?? relation.b;

          if (!aEntityName || !bEntityName) {
            console.warn("Skipping relation with missing entity name");
            continue;
          }

          // Look up the actual entity IDs from our map
          const aEntityId = entityIdMap.get(aEntityName);
          const bEntityId = entityIdMap.get(bEntityName);

          if (!aEntityId || !bEntityId) {
            console.warn(
              `Skipping relation: could not find entity IDs for "${aEntityName}" and/or "${bEntityName}"`
            );
            continue;
          }

          await trx.insert(analysisRelation).values({
            analysisId: analysisRecord.id,
            aEntityId: aEntityId,
            bEntityId: bEntityId,
            weight: relation.weight.toString(),
          });
        }
      }

      // Process follow-ups individually
      if (data.followUps && data.followUps.length > 0) {
        for (const followUp of data.followUps) {
          await trx.insert(analysisFollowUp).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            title: followUp.title,
            why: followUp.why ?? null,
            dueSuggestion: followUp.dueSuggestion,
            sourceStartChar:
              followUp.sourceStartChar ?? followUp.source?.startChar ?? 0,
            sourceEndChar:
              followUp.sourceEndChar ?? followUp.source?.endChar ?? 0,
            confidence: followUp.confidence.toString(),
          });
        }
      }

      // Process questions individually
      if (data.questionsUserAsked && data.questionsUserAsked.length > 0) {
        for (const question of data.questionsUserAsked) {
          await trx.insert(analysisQuestion).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            text: question.text,
            startChar: question.startChar,
            endChar: question.endChar,
          });
        }
      }

      // Insert digest if exists
      if (data.digest) {
        await trx.insert(analysisDigest).values({
          analysisId: analysisRecord.id,
          topMoments: data.digest.topMoments,
          themes: data.digest.themes,
          quoteOfDay: data.digest.quoteOfDay,
          tomorrowCues: data.digest.tomorrowCues,
        });
      }

      // Process QA chunks individually
      if (data.qaChunks && data.qaChunks.length > 0) {
        for (const chunk of data.qaChunks) {
          await trx.insert(analysisQaChunk).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            summary: chunk.summary,
            text: chunk.text,
            startChar: chunk.startChar,
            endChar: chunk.endChar,
            keywords: chunk.keywords,
          });
        }
      }

      // Process redaction candidates individually
      if (data.redactionCandidates && data.redactionCandidates.length > 0) {
        for (const redaction of data.redactionCandidates) {
          await trx.insert(analysisRedaction).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            type: redaction.type,
            text: redaction.text,
            startChar: redaction.startChar,
            endChar: redaction.endChar,
          });
        }
      }

      // Process nudge suggestions individually
      if (data.nudgeSuggestions && data.nudgeSuggestions.length > 0) {
        for (const nudge of data.nudgeSuggestions) {
          await trx.insert(analysisNudge).values({
            id: generateSecureRandomString(),
            analysisId: analysisRecord.id,
            kind: nudge.kind,
            text: nudge.text,
          });
        }
      }

      // Insert arc signals if exists
      if (data.arcSignals) {
        await trx.insert(analysisArc).values({
          analysisId: analysisRecord.id,
          stage: data.arcSignals.stage,
          rationale: data.arcSignals.rationale,
        });
      }

      return analysisRecord;
    });
  } catch (error) {
    console.error("Failed to create entry analysis:", error);
    throw new Error(
      `Failed to create entry analysis: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
