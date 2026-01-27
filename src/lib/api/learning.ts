import { api } from "./client";

// Types
export interface ChatSession {
  session_id: string;
  paper_hash: string;
  created_at: string;
  message_count: number;
  interests_extracted: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  should_extract_interests: boolean;
  message_count: number;
}

export interface ExtractedInterests {
  interests: string[];
  learning_goals: string[];
  expertise_level: string;
  focus_areas: string[];
}

export interface RecommendedResource {
  title: string;
  relevance_score: number;
  explanation: string;
  url?: string;
  resource_type: string;
  difficulty_match: number;
  thumbnail?: string;
  duration?: string;
  author?: string;
}

export interface Recommendations {
  pre_learning: RecommendedResource[];
  post_learning: RecommendedResource[];
  external_resources: RecommendedResource[];
  learning_path: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
  type: "current" | "prerequisite" | "extension" | "citation";
  color: string;
  size: number;
  citationCount: number;
  difficulty: number;
  topics: string[];
  url: string | null;
  index: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  prerequisites_count: number;
  extensions_count: number;
  citations_count: number;
  avg_citation_count: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: GraphStats;
  current_paper: string;
  generated_at: string;
}

// API Functions
export const learningAPI = {
  // Chat Session Management
  async createChatSession(paperHash: string): Promise<ChatSession> {
    const res = await api.post("/learning/chat/session", { paper_hash: paperHash });
    return res.data;
  },

  async getChatSession(sessionId: string): Promise<ChatSession & { messages: ChatMessage[] }> {
    const res = await api.get(`/learning/chat/sessions/${sessionId}`);
    return res.data;
  },

  // Chat Messages (non-streaming fallback)
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const res = await api.post("/learning/chat/message", {
      session_id: sessionId,
      message,
    });
    return res.data;
  },

  // Interest Extraction
  async extractInterests(sessionId: string): Promise<ExtractedInterests> {
    const res = await api.post("/learning/chat/extract-interests", {
      session_id: sessionId,
    });
    return res.data;
  },

  // Recommendations
  async getRecommendations(paperHash: string): Promise<Recommendations> {
    const res = await api.get(`/learning/recommendations/${paperHash}`);
    return res.data;
  },

  // Knowledge Graph Visualization (D3.js optimized)
  async getGraphVisualization(paperHash: string): Promise<KnowledgeGraph> {
    const res = await api.get(`/learning/graph/${paperHash}/visualization`);
    return res.data;
  },
};

// WebSocket URL builder
export function getChatWebSocketUrl(sessionId: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://insightway.in:8001";
  const wsUrl = baseUrl.replace(/^http/, "ws");
  return `${wsUrl}/learning/chat/stream/${sessionId}?token=${token}`;
}
