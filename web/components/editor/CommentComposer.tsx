import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  threadId?: string;
}

export default function CommentComposer({ threadId }: Props) {
  const [text, setText] = useState('');
  const createThread = useEditorStore((s) => s.createThread);
  const replyThread = useEditorStore((s) => s.replyThread);
  const draft = useEditorStore((s) => s.comments.draft?.anchor);

  const submit = () => {
    if (!text) return;
    if (threadId) replyThread(threadId, text);
    else if (draft) createThread(draft, text);
    setText('');
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={submit}>Send</button>
    </div>
  );
}
