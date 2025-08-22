import type { CommentUser } from '@/types/editor';

const users: CommentUser[] = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Carol' },
];

export function suggestMentions(query: string): CommentUser[] {
  const q = query.toLowerCase();
  return users.filter((u) => u.name.toLowerCase().startsWith(q));
}
