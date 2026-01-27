"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useAnalyses } from "@/lib/hooks/useAnalyses";
import { learningAPI, ChatMessage } from "@/lib/api/learning";
import { useChatStore } from "@/lib/chat/chatStore";
import { useChatStream } from "@/lib/hooks/useChatStream";

// Typing indicator component
function TypingIndicator() {
  return (
    <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#1a73e8",
          }}
        />
      ))}
    </Stack>
  );
}

// Message bubble component
function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          justifyContent: isUser ? "flex-end" : "flex-start",
          mb: 2,
        }}
      >
        {!isUser && (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        )}

        <Box
          sx={{
            maxWidth: "70%",
            p: 2,
            borderRadius: 3,
            bgcolor: isUser ? "primary.main" : "white",
            color: isUser ? "white" : "text.primary",
            border: isUser ? "none" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: isUser ? "0 2px 8px rgba(26,115,232,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                |
              </motion.span>
            )}
          </Typography>
        </Box>

        {isUser && (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "rgba(0,0,0,0.08)",
              color: "text.secondary",
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        )}
      </Stack>
    </motion.div>
  );
}

// Paper selector dialog
function PaperSelectorDialog({
  open,
  papers,
  onSelect,
  onClose,
}: {
  open: boolean;
  papers: Array<{ file_hash: string; file_name: string }>;
  onSelect: (hash: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Select a Paper to Chat About</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          Choose which paper you'd like to discuss with the AI assistant.
        </Typography>
        <List>
          {papers.map((paper) => (
            <ListItemButton
              key={paper.file_hash}
              onClick={() => onSelect(paper.file_hash)}
              sx={{
                borderRadius: 2,
                mb: 1,
                border: "1px solid rgba(0,0,0,0.06)",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(26,115,232,0.04)",
                },
              }}
            >
              <ListItemIcon>
                <DescriptionRoundedIcon sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText
                primary={paper.file_name?.replace(".pdf", "") || "Untitled Paper"}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [showPaperSelector, setShowPaperSelector] = useState(false);
  const [showExtractDialog, setShowExtractDialog] = useState(false);

  // Store
  const {
    session,
    setSession,
    messages,
    addMessage,
    updateLastAssistantMessage,
    setMessages,
    isStreaming,
    setIsStreaming,
    shouldExtractInterests,
    setShouldExtractInterests,
    interestsExtracted,
    setInterestsExtracted,
    selectedPaperHash,
    setSelectedPaperHash,
    reset,
  } = useChatStore();

  // Fetch user's papers
  const { data: analysesData, isLoading: loadingPapers } = useAnalyses(50, 0);
  const papers = analysesData?.analyses || [];

  // Create session mutation
  const createSession = useMutation({
    mutationFn: (paperHash: string) => learningAPI.createChatSession(paperHash),
    onSuccess: (data) => {
      setSession(data);
      // Add initial greeting
      addMessage({
        role: "assistant",
        content: `Hello! I'm here to help you understand this paper better. To give you personalized recommendations, I'd like to learn about your interests and goals.\n\nWhat aspect of this paper are you most curious about? Are you exploring it for:\n• Academic research\n• Practical implementation\n• General understanding\n• Something else?`,
      });
    },
  });

  // Extract interests mutation
  const extractInterests = useMutation({
    mutationFn: () => {
      if (!session) throw new Error("No session");
      return learningAPI.extractInterests(session.session_id);
    },
    onSuccess: () => {
      setInterestsExtracted(true);
      setShouldExtractInterests(false);
      // Redirect to learn page
      if (selectedPaperHash) {
        router.push(`/dashboard/learn?paper=${selectedPaperHash}`);
      }
    },
  });

  // Track pending message for REST fallback
  const pendingMessageRef = useRef<string | null>(null);

  // Function to send via REST API
  const sendViaRest = useCallback((messageText: string) => {
    if (!session) return;
    
    learningAPI
      .sendMessage(session.session_id, messageText)
      .then((response) => {
        updateLastAssistantMessage(response.response);
        setIsStreaming(false);
        if (response.should_extract_interests && response.message_count >= 3) {
          setShouldExtractInterests(true);
          setShowExtractDialog(true);
        }
      })
      .catch((err) => {
        const errorMsg = err?.response?.data?.detail || err?.message || "Unknown error";
        updateLastAssistantMessage(`Sorry, there was an error: ${errorMsg}. Please try again.`);
        setIsStreaming(false);
      });
  }, [session, updateLastAssistantMessage, setIsStreaming, setShouldExtractInterests]);

  // WebSocket streaming (with REST fallback)
  const { isConnected, connectionError, sendMessage: sendWsMessage } = useChatStream({
    sessionId: session?.session_id || null,
    onMessage: (content) => {
      pendingMessageRef.current = null; // Clear pending message on first chunk
      updateLastAssistantMessage(content);
    },
    onComplete: (fullResponse, shouldExtract, messageCount) => {
      pendingMessageRef.current = null;
      setIsStreaming(false);
      updateLastAssistantMessage(fullResponse);
      if (shouldExtract && messageCount >= 3) {
        setShouldExtractInterests(true);
        setShowExtractDialog(true);
      }
    },
    onError: (error) => {
      // If we have a pending message, try REST fallback
      if (pendingMessageRef.current) {
        const msg = pendingMessageRef.current;
        pendingMessageRef.current = null;
        sendViaRest(msg);
      } else {
        setIsStreaming(false);
        updateLastAssistantMessage(`Sorry, there was an error: ${error || "Connection lost"}. Please try again.`);
      }
    },
    onFallbackToRest: () => {
      // WebSocket timeout - fallback to REST
      if (pendingMessageRef.current) {
        const msg = pendingMessageRef.current;
        pendingMessageRef.current = null;
        sendViaRest(msg);
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-show paper selector if multiple papers and no selection
  useEffect(() => {
    if (!loadingPapers && papers.length > 0 && !selectedPaperHash) {
      if (papers.length === 1) {
        // Auto-select single paper
        handlePaperSelect(papers[0].file_hash);
      } else {
        setShowPaperSelector(true);
      }
    }
  }, [loadingPapers, papers, selectedPaperHash]);

  const handlePaperSelect = (hash: string) => {
    reset();
    setSelectedPaperHash(hash);
    setShowPaperSelector(false);
    createSession.mutate(hash);
  };

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || isStreaming || !session) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const messageText = input.trim();
    addMessage(userMessage);
    setInput("");

    // Add placeholder for assistant response
    addMessage({ role: "assistant", content: "" });
    setIsStreaming(true);

    // Try WebSocket first if connected, otherwise use REST API
    if (isConnected) {
      // Store message for potential REST fallback
      pendingMessageRef.current = messageText;
      const wsSent = sendWsMessage(messageText);
      
      if (!wsSent) {
        // WebSocket send failed, use REST immediately
        pendingMessageRef.current = null;
        sendViaRest(messageText);
      }
    } else {
      // WebSocket not connected, use REST API directly
      sendViaRest(messageText);
    }
  }, [input, isStreaming, session, isConnected, sendWsMessage, addMessage, setIsStreaming, sendViaRest]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedPaper = papers.find((p) => p.file_hash === selectedPaperHash);

  // Empty state - no papers
  if (!loadingPapers && papers.length === 0) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 140px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            maxWidth: 400,
            border: "1px dashed rgba(0,0,0,0.15)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "rgba(26,115,232,0.08)",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <DescriptionRoundedIcon sx={{ fontSize: 32, color: "primary.main" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
            No Papers Available
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Upload and analyze a paper first to start chatting about it.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/upload")}
            sx={{ borderRadius: 2.5, fontWeight: 600 }}
          >
            Upload Paper
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pb: 2,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 24 }}>AI Chat</Typography>
          {selectedPaper && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <DescriptionRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {selectedPaper.file_name?.replace(".pdf", "")}
              </Typography>
              <Button
                size="small"
                onClick={() => setShowPaperSelector(true)}
                sx={{ ml: 1, fontSize: 12 }}
              >
                Change
              </Button>
            </Stack>
          )}
        </Box>

        {shouldExtractInterests && !interestsExtracted && (
          <Button
            variant="contained"
            startIcon={<SchoolRoundedIcon />}
            onClick={() => setShowExtractDialog(true)}
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
            }}
          >
            Get Recommendations
          </Button>
        )}
      </Stack>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 1,
        }}
      >
        {createSession.isPending ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <CircularProgress size={32} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Starting chat session...
            </Typography>
          </Stack>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
          </AnimatePresence>
        )}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <TypingIndicator />
            </Box>
          </Stack>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          pt: 2,
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <TextField
            ref={inputRef}
            fullWidth
            placeholder={session ? "Ask about this paper..." : "Select a paper to start chatting"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!session || isStreaming}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "white",
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!input.trim() || !session || isStreaming}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 48,
              height: 48,
              "&:hover": { bgcolor: "primary.dark" },
              "&:disabled": { bgcolor: "rgba(0,0,0,0.08)", color: "text.disabled" },
            }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Stack>

        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary", textAlign: "center" }}>
          AI responses are based on the selected paper's content
        </Typography>
      </Box>

      {/* Paper Selector Dialog */}
      <PaperSelectorDialog
        open={showPaperSelector}
        papers={papers}
        onSelect={handlePaperSelect}
        onClose={() => setShowPaperSelector(false)}
      />

      {/* Extract Interests Dialog */}
      <Dialog open={showExtractDialog} onClose={() => setShowExtractDialog(false)} maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Get Personalized Recommendations?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Based on our conversation, I can generate personalized learning recommendations including:
          </Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Chip label="Pre-learning resources" sx={{ width: "fit-content" }} />
            <Chip label="Advanced follow-up papers" sx={{ width: "fit-content" }} />
            <Chip label="External tutorials & videos" sx={{ width: "fit-content" }} />
            <Chip label="Structured learning path" sx={{ width: "fit-content" }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowExtractDialog(false)} sx={{ fontWeight: 600 }}>
            Continue Chatting
          </Button>
          <Button
            variant="contained"
            onClick={() => extractInterests.mutate()}
            disabled={extractInterests.isPending}
            sx={{ fontWeight: 600, borderRadius: 2.5 }}
          >
            {extractInterests.isPending ? "Generating..." : "Get Recommendations"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
