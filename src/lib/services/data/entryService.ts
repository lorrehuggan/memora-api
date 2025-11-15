import {
  AnalyserOutput,
  CreateEntryParams,
  CreateEntryTranscriptParams,
} from "@/types/reflections";

import { createEntryAction } from "./actions/entry/createEntryAction";
import { createEntryAnalysisAction } from "./actions/entry/createEntryAnalysis";
import { createEntryTranscriptAction } from "./actions/entry/createEntryTranscript";

export class ReflectionsService {
  static async createEntry(data: CreateEntryParams) {
    return await createEntryAction(data);
  }

  static async createEntryTranscript(data: CreateEntryTranscriptParams) {
    return await createEntryTranscriptAction(data);
  }

  static async createEntryAnalysis(data: AnalyserOutput, entryId: string) {
    return await createEntryAnalysisAction(entryId, data);
  }
}
