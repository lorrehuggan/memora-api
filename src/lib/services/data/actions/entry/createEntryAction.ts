import { db } from "@/db/client";
import { entry } from "@/db/schema/entry";
import { generateSecureRandomString } from "@/lib/utils/generateSecureRandomString";
import { CreateEntryParams } from "@/types/reflections";

export const createEntryAction = async (data: CreateEntryParams) => {
  try {
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
  } catch (error) {
    console.error("Failed to create reflection:", error);
    throw new Error(
      `Failed to create reflection: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
