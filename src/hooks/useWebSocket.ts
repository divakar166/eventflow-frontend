import { useEffect, useRef, useCallback, useState } from "react";
import Cookies from "js-cookie";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";

interface UseWebSocketOptions {
  onMessage: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  enabled?: boolean;
}

export function useWebSocket(path: string, options: UseWebSocketOptions) {
  const { onMessage, onOpen, onClose, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const [isConnected, setIsConnected] = useState(false);

  const getWsUrl = useCallback(() => {
    if (typeof window === "undefined") return null;
    const host = window.location.hostname;
    return `ws://${host}:${API_PORT}${path}`;
  }, [path]);

  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url || !enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        onMessage(event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onClose?.();
      // Auto-reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [getWsUrl, enabled, onMessage, onOpen, onClose]);

  useEffect(() => {
    if (!enabled) return;
    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect, enabled]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, send };
}
