"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
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
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

import { usePapers } from "@/lib/contexts/AppDataContext";
import { learningAPI, ChatMessage } from "@/lib/api/learning";
import { useChatStore } from "@/lib/chat/chatStore";
import { useChatStream } from "@/lib/hooks/useChatStream";
import EmptyState from "@/components/ui/EmptyState";

// Suggested prompts for new conversations
const suggestedPrompts = [
  "What are the main contributions of this paper?",
  "Explain the methodology used in simple terms",
  "What are the limitations mentioned?",
  "How does this compare to related work?",
];

// Typing indicator component
const TypingIndicator = memo(function TypingIndicator() {
  return (
    <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
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
});

// Message bubble component with timestamps and copy
const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming,
  timestamp,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  timestamp?: Date;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: isUser ? "flex-end" : "flex-start", mb: 2.5 }}
      >
        {!isUser && (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}

        <Box sx={{ maxWidth: "75%" }}>
          <Box
            sx={{
              p: 2,
              px: 2.5,
              borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              bgcolor: isUser ? "primary.main" : "white",
              color: isUser ? "white" : "text.primary",
              border: isUser ? "none" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isUser
                ? "0 2px 12px rgba(26,115,232,0.25)"
                : "0 2px 8px rgba(0,0,0,0.04)",
              position: "relative",
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message.content}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ marginLeft: 2 }}
                >
                  |
                </motion.span>
              )}
            </Typography>

            {/* Copy button for assistant messages */}
            {!isUser && message.content && !isStreaming && (
              <Tooltip title={copied ? "Copied!" : "Copy"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    ".MuiBox-root:hover &": { opacity: 1 },
                    color: "text.secondary",
                  }}
                >
                  {copied ? (
                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Timestamp */}
          {formattedTime && (
            <Typography
              sx={{
                fontSize: 11,
                color: "text.disabled",
                mt: 0.5,
                px: 1,
                textAlign: isUser ? "right" : "left",
              }}
            >
              {formattedTime}
            </Typography>
          )}
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
            <PersonRoundedIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Stack>
    </motion.div>
  );
});

// Paper selector inline component with dropdown
const PaperSelector = memo(function PaperSelector({
  papers,
  selectedHash,
  onSelect,
}: {
  papers: Array<{ file_hash: string; file_name: string; has_analysis?: boolean }>;
  selectedHash: string | null;
  onSelect: (hash: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const selectedPaper = papers.find((p) => p.file_hash === selectedHash);
  const currentIdx = papers.findIndex((p) => p.file_hash === selectedHash);

  const handleQuickSwitch = () => {
    const nextIdx = (currentIdx + 1) % papers.length;
    onSelect(papers[nextIdx].file_hash);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          bgcolor: "rgba(26,115,232,0.02)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(26,115,232,0.1)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <DescriptionRoundedIcon sx={{ color: "#1a73e8", fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Chatting about
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
              {selectedPaper?.file_name?.replace(".pdf", "") || "Select a paper"}
            </Typography>
          </Box>

          {papers.length > 1 && (
            <Stack direction="row" spacing={1}>
              {/* Quick switch to next paper */}
              <Tooltip title="Quick switch to next paper">
                <IconButton
                  size="small"
                  onClick={handleQuickSwitch}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.04)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                  }}
                >
                  <SwapHorizRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Select from list */}
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<KeyboardArrowDownRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: "rgba(26,115,232,0.3)",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(26,115,232,0.04)",
                  },
                }}
              >
                Select Paper
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Paper selection menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            maxHeight: 320,
            width: 360,
            borderRadius: 2,
            mt: 0.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
            Select a Paper
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {papers.length} papers available
          </Typography>
        </Box>

        {papers.map((paper, idx) => (
          <MenuItem
            key={paper.file_hash}
            selected={paper.file_hash === selectedHash}
            onClick={() => {
              onSelect(paper.file_hash);
              setAnchorEl(null);
            }}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: idx < papers.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
              "&.Mui-selected": {
                bgcolor: "rgba(26,115,232,0.08)",
              },
              "&:hover": {
                bgcolor: "rgba(26,115,232,0.04)",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: paper.file_hash === selectedHash ? "primary.main" : "rgba(0,0,0,0.06)",
                  color: paper.file_hash === selectedHash ? "white" : "text.secondary",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: paper.file_hash === selectedHash ? 600 : 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {paper.file_name?.replace(".pdf", "")}
                </Typography>
                {paper.has_analysis && (
                  <Chip
                    label="Analyzed"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      mt: 0.5,
                      bgcolor: "rgba(34,197,94,0.1)",
                      color: "#16a34a",
                    }}
                  />
                )}
              </Box>
              {paper.file_hash === selectedHash && (
                <CheckRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              )}
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

// Suggested prompts component
const SuggestedPrompts = memo(function SuggestedPrompts({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <LightbulbRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
        <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>
          Try asking...
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {suggestedPrompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            onClick={() => onSelect(prompt)}
            sx={{
              cursor: "pointer",
              fontSize: 13,
              height: 32,
              bgcolor: "rgba(26,115,232,0.06)",
              border: "1px solid rgba(26,115,232,0.1)",
              "&:hover": {
                bgcolor: "rgba(26,115,232,0.12)",
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
});

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [input, setInput] = useState("");
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [messageTimestamps] = useState<Map<number, Date>>(new Map());

  const { papers, isLoading: loadingPapers } = usePapers();

  const {
    session,
    setSession,
    messages,
    addMessage,
    updateLastAssistantMessage,
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

  // Create session mutation
  const sessionCreatedRef = useRef(false);
  const createSession = useMutation({
    mutationFn: (paperHash: string) => learningAPI.createChatSession(paperHash),
    onSuccess: (data) => {
      // Prevent duplicate initial message
      if (sessionCreatedRef.current) return;
      sessionCreatedRef.current = true;
      
      setSession(data);
      addMessage({
        role: "assistant",
        content: `Hi! I'm ready to help you understand this paper. You can ask me about the methodology, findings, or any specific concepts.\n\nWhat would you like to know?`,
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
      if (selectedPaperHash) {
        router.push(`/dashboard/learn?paper=${selectedPaperHash}`);
      }
    },
  });

  // REST fallback
  const pendingMessageRef = useRef<string | null>(null);

  const sendViaRest = useCallback(
    (messageText: string) => {
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
    },
    [session, updateLastAssistantMessage, setIsStreaming, setShouldExtractInterests]
  );

  // WebSocket streaming
  const { isConnected, sendMessage: sendWsMessage } = useChatStream({
    sessionId: session?.session_id || null,
    onMessage: (content) => {
      pendingMessageRef.current = null;
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
      if (pendingMessageRef.current) {
        const msg = pendingMessageRef.current;
        pendingMessageRef.current = null;
        sendViaRest(msg);
      }
    },
  });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-select paper (only once on mount)
  useEffect(() => {
    if (!loadingPapers && papers.length > 0 && !selectedPaperHash && !initializedRef.current) {
      initializedRef.current = true;
      handlePaperSelect(papers[0].file_hash);
    }
  }, [loadingPapers, papers, selectedPaperHash]);

  const handlePaperSelect = useCallback(
    (hash: string) => {
      sessionCreatedRef.current = false; // Reset for new paper
      reset();
      setSelectedPaperHash(hash);
      createSession.mutate(hash);
    },
    [reset, setSelectedPaperHash, createSession]
  );

  const handleSendMessage = useCallback(
    (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isStreaming || !session) return;

      addMessage({ role: "user", content: messageText });
      setInput("");

      addMessage({ role: "assistant", content: "" });
      setIsStreaming(true);

      if (isConnected) {
        pendingMessageRef.current = messageText;
        const wsSent = sendWsMessage(messageText);
        if (!wsSent) {
          pendingMessageRef.current = null;
          sendViaRest(messageText);
        }
      } else {
        sendViaRest(messageText);
      }
    },
    [input, isStreaming, session, isConnected, sendWsMessage, addMessage, setIsStreaming, sendViaRest]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

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
        <EmptyState
          icon={DescriptionRoundedIcon}
          title="No Papers Available"
          description="Upload and analyze a paper first to start chatting about it."
          action={{
            label: "Upload Paper",
            onClick: () => router.push("/dashboard/upload"),
          }}
          variant="illustrated"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      {/* Paper selector */}
      <PaperSelector
        papers={papers}
        selectedHash={selectedPaperHash}
        onSelect={handlePaperSelect}
      />

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 1,
          py: 2,
        }}
      >
        {createSession.isPending ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <CircularProgress size={32} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Starting conversation...
            </Typography>
          </Stack>
        ) : (
          <>
            {/* Show suggested prompts if only initial message */}
            {messages.length === 1 && !isStreaming && (
              <SuggestedPrompts onSelect={(prompt) => handleSendMessage(prompt)} />
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
                  timestamp={messageTimestamps.get(idx)}
                />
              ))}
            </AnimatePresence>

            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "20px 20px 20px 4px",
                    bgcolor: "white",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <TypingIndicator />
                </Box>
              </Stack>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Get recommendations button */}
      {shouldExtractInterests && !interestsExtracted && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SchoolRoundedIcon />}
            onClick={() => setShowExtractDialog(true)}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(26,115,232,0.3)",
            }}
          >
            Get Personalized Learning Recommendations
          </Button>
        </Box>
      )}

      {/* Input area */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "white",
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <TextField
            fullWidth
            placeholder={session ? "Ask anything about this paper..." : "Loading..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!session || isStreaming}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.02)",
                "&.Mui-focused": {
                  bgcolor: "white",
                },
              },
            }}
          />
          <IconButton
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || !session || isStreaming}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 52,
              height: 52,
              borderRadius: 3,
              boxShadow: "0 4px 14px rgba(26,115,232,0.3)",
              "&:hover": { bgcolor: "primary.dark" },
              "&:disabled": { bgcolor: "rgba(0,0,0,0.08)", color: "text.disabled", boxShadow: "none" },
            }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Extract Interests Dialog */}
      <Dialog open={showExtractDialog} onClose={() => setShowExtractDialog(false)} maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Get Personalized Recommendations?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Based on our conversation, I can generate personalized learning recommendations:
          </Typography>
          <Stack spacing={1}>
            <Chip icon={<SchoolRoundedIcon />} label="Pre-learning resources" sx={{ justifyContent: "flex-start" }} />
            <Chip icon={<SchoolRoundedIcon />} label="Advanced follow-up papers" sx={{ justifyContent: "flex-start" }} />
            <Chip icon={<SchoolRoundedIcon />} label="External tutorials & videos" sx={{ justifyContent: "flex-start" }} />
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
