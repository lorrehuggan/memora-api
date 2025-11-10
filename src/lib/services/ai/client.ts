import OpenAI from "openai";

if (!process.env.OPENAI_API_SECRET) {
  throw new Error("OPENAI_API_SECRET is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_SECRET, // Make sure to set this
});
