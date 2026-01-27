import { create } from "zustand";
import { ChatMessage, ChatSession, ExtractedInterests } from "@/lib/api/learning";

interface ChatState {
  // Session
  session: ChatSession | null;
  setSession: (session: ChatSession | null) => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;

  // Streaming
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  // Interest extraction
  shouldExtractInterests: boolean;
  setShouldExtractInterests: (should: boolean) => void;
  extractedInterests: ExtractedInterests | null;
  setExtractedInterests: (interests: ExtractedInterests | null) => void;
  interestsExtracted: boolean;
  setInterestsExtracted: (extracted: boolean) => void;

  // Selected paper
  selectedPaperHash: string | null;
  setSelectedPaperHash: (hash: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  session: null,
  messages: [],
  streamingContent: "",
  isStreaming: false,
  shouldExtractInterests: false,
  extractedInterests: null,
  interestsExtracted: false,
  selectedPaperHash: null,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = { ...messages[lastIdx], content };
      }
      return { messages };
    }),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setStreamingContent: (content) => set({ streamingContent: content }),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  setShouldExtractInterests: (should) => set({ shouldExtractInterests: should }),

  setExtractedInterests: (interests) => set({ extractedInterests: interests }),

  setInterestsExtracted: (extracted) => set({ interestsExtracted: extracted }),

  setSelectedPaperHash: (hash) => set({ selectedPaperHash: hash }),

  reset: () => set(initialState),
}));
