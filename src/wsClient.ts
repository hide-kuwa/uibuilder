export type WSMessage =
  | { type: 'edit'; data: any; user?: string }
  | { type: 'presence'; users: string[] };

type Listener = (msg: WSMessage) => void;

export default class PageWSClient {
  private ws: WebSocket | null = null;
  private listeners: Listener[] = [];
  private retry = 1000;

  constructor(private url: string, private token: string, private pageId: string) {
    this.connect();
  }

  private connect() {
    const wsUrl = `${this.url.replace(/\/$/, '')}/ws/pages/${this.pageId}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.listeners.forEach((l) => l(msg));
    };
    this.ws.onclose = () => {
      setTimeout(() => this.connect(), this.retry);
    };
  }

  sendEdit(data: any) {
    this.ws?.send(JSON.stringify({ type: 'edit', data }));
  }

  on(fn: Listener) {
    this.listeners.push(fn);
  }
}
