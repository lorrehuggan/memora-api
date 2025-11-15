import { $ } from "bun";
import { Hono } from "hono";

import { ReflectionsService } from "@/lib/services/data/entryService";
import { openai } from "@/services/ai/client";
import {
  ANALYZER_SYSTEM_PROMPT,
  TRANSCRIBER_SYSTEM_PROMPT,
} from "@/services/ai/prompts/refelctions";
import { auth } from "@/services/auth";
import { uploadReflectionToS3 } from "@/services/s3/uploadReflection";
import { AnalyserOutput } from "@/types/reflections";
import { generateSecureRandomString } from "@/utils/generateSecureRandomString";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

type Metadata = {
  title: string;
  description: string;
};

app.post("/create", async c => {
  const formData = await c.req.formData();
  const file = formData.get("audio") as File;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const metadata = { title, description };
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], { type: file.type });
  const url = URL.createObjectURL(blob);
  const session = c.get("session");

  let inputPath: string | undefined;
  let outputPath: string | undefined;

  try {
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = session.userId;

    const identifier = generateSecureRandomString();
    const fileExt = file.name.split(".").pop() ?? "audio";
    inputPath = `/tmp/input-${identifier}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    outputPath = `/tmp/output-${identifier}-${Math.random().toString(36).slice(2)}.ogg`;

    await Bun.write(inputPath, file);

    try {
      await $`ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a libvorbis -q:a 4 -y ${outputPath}`;
    } catch (ffmpegError) {
      // Clean up temporary files on FFmpeg error
      try {
        await Bun.write(inputPath, "");
        await Bun.write(outputPath, "");
      } catch {
        // Ignore cleanup errors
      }
      c.status(500);
      return c.json({
        success: false,
        error: "Audio conversion failed",
        details:
          process.env.NODE_ENV === "development" ? ffmpegError : undefined,
      });
    }
    const convertedBuffer = await Bun.file(outputPath).arrayBuffer();
    const convertedFileName = file.name.replace(/\.[^/.]+$/, ".ogg");
    const convertedFile = new File([convertedBuffer], convertedFileName, {
      type: "audio/ogg",
    });
    const transcription = await openai.audio.transcriptions.create({
      file: Bun.file(outputPath),
      model: "gpt-4o-transcribe",
      response_format: "json",
      temperature: 0,
      prompt: TRANSCRIBER_SYSTEM_PROMPT,
    });
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Transcription completed:", {
        success: true,
        textLength: transcription.text.length,
        text: transcription.text,
      });
    }
    const analysis = await openai.responses.create({
      input: transcription.text,
      instructions: ANALYZER_SYSTEM_PROMPT,
      model: "gpt-4.1-mini",
    });
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Analysis completed:", {
        success: true,
        output: analysis.output,
      });
    }

    const analysisOutput = JSON.parse(
      analysis.output_text
    ) as unknown as AnalyserOutput;

    const { filePath, publicUrl } = await uploadReflectionToS3(
      convertedFile,
      convertedFileName
    );

    const relflectionRecord = await ReflectionsService.createEntry({
      userId: user,
      filePath,
      publicUrl,
      originalFileName: file.name,
    });

    const reflectionTranscript = await ReflectionsService.createEntryTranscript(
      {
        entryId: relflectionRecord.id,
        transcript: transcription.text,
      }
    );

    await ReflectionsService.createEntryAnalysis(
      analysisOutput,
      relflectionRecord.id
    );

    return c.json({
      success: true,
      transcript: reflectionTranscript.transcript,
    });
  } catch (error) {
    console.error(error);
    return c.json({
      success: false,
    });
  }
});

export default app;
