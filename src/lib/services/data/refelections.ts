import { db } from "@/lib/db/client";
import { entry, entryTranscript } from "@/lib/db/schema/entry";
import { generateSecureRandomString } from "@/lib/utils/generateSecureRandomString";

type CreateReflectionParams = {
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

type CreateReflectionTranscriptParams = {
  entryId: string;
  transcript: string;
};

export class ReflectionsService {
  static async createReflection(data: CreateReflectionParams) {
    const [reflectionRecord] = await db
      .insert(entry)
      .values({
        id: generateSecureRandomString(),
        userId: data.userId,
        createdAt: new Date(),
        filePath: data.filePath,
        fileSize: data.fileSize,
        fileDuration: data.fileDuration,
        publicUrl: data.publicUrl,
        bucket: data.bucket,
        originalFileName: data.originalFileName,
      })
      .returning();
    return reflectionRecord;
  }
  static async createReflectionTranscript(
    data: CreateReflectionTranscriptParams
  ) {
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
  }
}
