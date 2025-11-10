import { createClient } from "@supabase/supabase-js";

import { generateSecureRandomString } from "@/lib/utils/generateSecureRandomString";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function uploadReflectionToS3(file: File, name: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const identifier = generateSecureRandomString();

  const filePath = `audio/${Date.now()}-${identifier}-${name}`;

  const { error } = await supabase.storage
    .from("reflections")
    .upload(filePath, buffer, {
      contentType: file.type || "audio/m4a",
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL (if bucket is public)
  const { data: publicUrlData } = supabase.storage
    .from("reflections")
    .getPublicUrl(filePath);

  return { filePath, publicUrl: publicUrlData.publicUrl };
}
