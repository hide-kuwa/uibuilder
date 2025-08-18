export type Handler<T = any> = (payload: T) => void;

interface Message<T = any> {
  type: string;
  payload?: T;
}

/**
 * Bridge for communicating with a parent window. Supports both postMessage
 * and MessageChannel for high frequency updates.
 */
export default class EditorBridge {
  private handlers = new Map<string, Set<Handler>>();
  private allowedOrigins: string[];
  private port: MessagePort | null = null;
  private heartbeatInterval: number;
  private lastPong = Date.now();
  private heartbeatTimer: number | undefined;

  constructor(allowedOrigins: string[], heartbeatInterval = 5000) {
    this.allowedOrigins = allowedOrigins;
    this.heartbeatInterval = heartbeatInterval;
    window.addEventListener('message', this.handleWindowMessage);
    this.startHeartbeat();
  }

  private handleWindowMessage = (event: MessageEvent) => {
    if (!this.allowedOrigins.includes(event.origin)) return;
    const { data } = event;
    if (!data || typeof (data as any).type !== 'string') return;

    if ((data as any).type === 'init-channel' && event.ports && event.ports[0]) {
      this.setupPort(event.ports[0]);
      return;
    }

    if ((data as any).type === 'pong') {
      this.lastPong = Date.now();
      return;
    }

    this.emitToHandlers((data as any).type, (data as any).payload);
  };

  private setupPort(port: MessagePort) {
    if (this.port) {
      this.port.onmessage = null;
      this.port.close();
    }
    this.port = port;
    this.port.onmessage = this.handlePortMessage;
    // @ts-ignore start may not exist in some environments
    this.port.start && this.port.start();
  }

  private handlePortMessage = (event: MessageEvent) => {
    const { data } = event;
    if (!data || typeof (data as any).type !== 'string') return;

    if ((data as any).type === 'pong') {
      this.lastPong = Date.now();
      return;
    }

    this.emitToHandlers((data as any).type, (data as any).payload);
  };

  private emitToHandlers(type: string, payload: any) {
    const set = this.handlers.get(type);
    if (set) {
      set.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  on<T = any>(type: string, handler: Handler<T>) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler as Handler);
  }

  off<T = any>(type: string, handler: Handler<T>) {
    this.handlers.get(type)?.delete(handler as Handler);
  }

  emit(type: string, payload?: any) {
    const message: Message = { type, payload };
    if (this.port) {
      try {
        this.port.postMessage(message);
        return;
      } catch {
        this.port = null; // fall back
      }
    }
    window.parent.postMessage(message, '*');
  }

  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastPong > this.heartbeatInterval * 2) {
        this.emitToHandlers('disconnect', undefined);
      }
      this.emit('ping', now);
    }, this.heartbeatInterval);
  }

  destroy() {
    window.removeEventListener('message', this.handleWindowMessage);
    this.port?.close();
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
  }
}
