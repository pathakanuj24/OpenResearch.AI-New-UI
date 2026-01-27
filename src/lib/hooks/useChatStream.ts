"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "@/lib/firebase";

interface UseChatStreamOptions {
  sessionId: string | null;
  onMessage?: (content: string) => void;
  onComplete?: (fullResponse: string, shouldExtract: boolean, messageCount: number) => void;
  onError?: (error: string) => void;
  onFallbackToRest?: () => void;
}

export function useChatStream({
  sessionId,
  onMessage,
  onComplete,
  onError,
  onFallbackToRest,
}: UseChatStreamOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const responseRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const MESSAGE_TIMEOUT = 30000; // 30 seconds timeout for response
  const THROTTLE_MS = 50; // Throttle UI updates to every 50ms
  
  // Store callbacks in refs to avoid effect re-runs
  const onMessageRef = useRef(onMessage);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onFallbackToRestRef = useRef(onFallbackToRest);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
    onFallbackToRestRef.current = onFallbackToRest;
  }, [onMessage, onComplete, onError, onFallbackToRest]);

  const clearMessageTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearThrottle = useCallback(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
      throttleRef.current = null;
    }
  }, []);

  // Throttled message update to prevent too many re-renders
  const throttledOnMessage = useCallback((content: string) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate >= THROTTLE_MS) {
      // Enough time has passed, update immediately
      lastUpdateRef.current = now;
      onMessageRef.current?.(content);
    } else {
      // Schedule an update for the remaining time
      clearThrottle();
      throttleRef.current = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        onMessageRef.current?.(responseRef.current);
      }, THROTTLE_MS - timeSinceLastUpdate);
    }
  }, [clearThrottle]);

  const sendMessage = useCallback(
    (message: string): boolean => {
      if (!socketRef.current || !isConnected) {
        return false;
      }

      responseRef.current = "";
      lastUpdateRef.current = 0; // Reset throttle timing
      clearThrottle();
      setIsStreaming(true);

      // Set timeout for response
      clearMessageTimeout();
      timeoutRef.current = setTimeout(() => {
        if (responseRef.current === "") {
          // No response received, suggest fallback to REST
          setIsStreaming(false);
          onFallbackToRestRef.current?.();
        }
      }, MESSAGE_TIMEOUT);

      try {
        socketRef.current.emit("send_message", { message });
        return true;
      } catch {
        clearMessageTimeout();
        clearThrottle();
        setIsStreaming(false);
        return false;
      }
    },
    [clearMessageTimeout, clearThrottle, isConnected]
  );

  const disconnect = useCallback(() => {
    clearMessageTimeout();
    clearThrottle();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsStreaming(false);
  }, [clearMessageTimeout, clearThrottle]);

  // Main connection effect
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const initSocket = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        
        if (cancelled) return;
        
        if (!token) {
          setConnectionError("Not authenticated");
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

        // Create Socket.IO connection
        const socket = io(baseUrl, {
          transports: ["websocket", "polling"],
          autoConnect: true,
        });

        socketRef.current = socket;

        // Connection established
        socket.on("connect", () => {
          if (cancelled) {
            socket.disconnect();
            return;
          }
          
          // Authenticate immediately after connection
          socket.emit("authenticate", {
            token: token,
            session_id: sessionId,
          });
        });

        // Authentication successful
        socket.on("authenticated", () => {
          if (cancelled) return;
          setIsConnected(true);
          setConnectionError(null);
        });

        // Message streaming events
        socket.on("message_start", () => {
          if (cancelled) return;
          responseRef.current = "";
          clearMessageTimeout();
        });

        socket.on("message_chunk", (data: { content: string }) => {
          if (cancelled) return;
          clearMessageTimeout();
          responseRef.current += data.content;
          // Use throttled update to prevent UI jank
          throttledOnMessage(responseRef.current);
        });

        socket.on("message_end", (data: { 
          should_extract_interests?: boolean; 
          message_count?: number;
          content?: string;
        }) => {
          if (cancelled) return;
          clearMessageTimeout();
          clearThrottle(); // Clear any pending throttled updates
          setIsStreaming(false);
          
          const finalContent = responseRef.current || data.content || "";
          onCompleteRef.current?.(
            finalContent,
            data.should_extract_interests || false,
            data.message_count || 0
          );
          responseRef.current = "";
        });

        // Error handling
        socket.on("error", (data: { error?: string; message?: string }) => {
          if (cancelled) return;
          clearMessageTimeout();
          clearThrottle();
          setIsStreaming(false);
          const errorMsg = data.error || data.message || "An error occurred";
          onErrorRef.current?.(errorMsg);
          responseRef.current = "";
        });

        socket.on("auth_error", (data: { error?: string; message?: string }) => {
          if (cancelled) return;
          const errorMsg = data.error || data.message || "Authentication failed";
          setConnectionError(errorMsg);
          setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
          if (cancelled) return;
          setConnectionError("Connection failed. Using REST API.");
          setIsConnected(false);
        });

        socket.on("disconnect", (reason) => {
          if (cancelled) return;
          setIsConnected(false);
          clearThrottle();
          
          // If disconnected while streaming, trigger fallback
          if (responseRef.current === "" && timeoutRef.current) {
            clearMessageTimeout();
            setIsStreaming(false);
            onFallbackToRestRef.current?.();
          }
        });

      } catch (error) {
        if (cancelled) return;
        setConnectionError("Failed to establish connection");
      }
    };

    setConnectionError(null);
    setIsConnected(false);
    initSocket();

    // Cleanup function
    return () => {
      cancelled = true;
      clearMessageTimeout();
      clearThrottle();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setIsStreaming(false);
    };
  }, [sessionId, clearMessageTimeout, clearThrottle, throttledOnMessage]);

  return {
    isConnected,
    isStreaming,
    connectionError,
    sendMessage,
    disconnect,
  };
}
