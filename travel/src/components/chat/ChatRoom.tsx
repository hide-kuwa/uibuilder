'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { trackEvent } from '../../lib/analytics';

interface ChatRoomProps { planId: string }

interface Message {
  id: string;
  text: string;
  createdAt: any;
}

export default function ChatRoom({ planId }: ChatRoomProps) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'plans', planId, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, [planId]);

  const sendMessage = async () => {
    if (!text) return;
    await addDoc(collection(db, 'plans', planId, 'messages'), {
      text,
      createdAt: serverTimestamp(),
    });
    trackEvent('chat_message_sent');
    setText('');
  };

  return (
    <div>
      <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
        {messages.map((m) => (
          <div key={m.id}>{m.text}</div>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
