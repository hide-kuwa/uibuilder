export type Patch = { op: 'replace' | 'add' | 'remove'; path: (string | number)[]; value?: any };

export interface Operation {
  id: string;
  docId: string;
  clientId: string;
  sessionId: string;
  baseRev: number;
  patches: Patch[];
  ts: number;
}

export interface Envelope {
  docId: string;
  clientId: string;
  lastAckRev: number;
  ops: Operation[];
}

export interface ServerReply {
  headRev: number;
  accepted: string[];
  serverOpsSince?: Operation[];
  conflict?: boolean;
}
