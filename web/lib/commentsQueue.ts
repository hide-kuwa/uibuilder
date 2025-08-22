export type CommentOp = 'create' | 'reply' | 'resolve';
export interface QueueItem { op: CommentOp; payload: any }

const queue: QueueItem[] = [];

export function enqueue(item: QueueItem) {
  queue.push(item);
}

export function dequeue(): QueueItem | undefined {
  return queue.shift();
}

export function peekAll(): QueueItem[] {
  return [...queue];
}
