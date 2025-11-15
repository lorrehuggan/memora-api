import { db } from "@/db/client";
import { entryTranscript } from "@/lib/services/db/schema/entry";
import { generateSecureRandomString } from "@/lib/utils/generateSecureRandomString";
import { CreateEntryTranscriptParams } from "@/types/reflections";

export const createEntryTranscriptAction = async (
  data: CreateEntryTranscriptParams
) => {
  try {
    const [reflectionTranscript] = await db
      .insert(entryTranscript)
      .values({
        id: generateSecureRandomString(),
        entryId: data.entryId,
        createdAt: new Date(),
        updatedAt: new Date(),
        transcript: data.transcript,
      })
      .returning();
    return reflectionTranscript;
  } catch (error) {
    console.error("Failed to create reflection transcript:", error);
    throw new Error(
      `Failed to create reflection transcript: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
