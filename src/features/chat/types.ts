import type { UIMessage } from "ai";

export type AgentStepData = {
  label: string;
  tool: string;
  status: "running" | "done" | "error";
  detail?: string | null;
  ms?: number;
};

export type SourceData = {
  index: number;
  chunk_id: string;
  paper_id: string;
  paper_title?: string | null;
  section: string;
  page: number;
  page_end: number;
  quote: string;
  score: number;
};

export type ConceptData = { name: string; definition?: string | null; requires?: string[] };

export type ResourceData = {
  url: string;
  title: string;
  kind: "video" | "article" | "paper" | "course";
  source: string;
  why: string;
  duration?: string;
  concept?: string;
};

/** UIMessage with the data parts /v2/chat streams. */
export type ResearchMessage = UIMessage<
  never,
  {
    "agent-step": AgentStepData;
    citations: { cited: number[]; sources: SourceData[] };
    concepts: ConceptData[];
    resources: ResourceData[];
  }
>;
