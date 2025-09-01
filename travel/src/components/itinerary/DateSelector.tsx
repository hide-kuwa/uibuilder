import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getFirestore,
} from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase';

export type VoteValue = '\u25EF' | '\u25B3' | '\u2715'; // ◯=◯, △=△, ✕=✕

interface DateRange {
  start: string; // ISO string
  end: string;   // ISO string
}

interface DateVoteDoc {
  id: string;
  range: DateRange;
  votes: Record<string, VoteValue>;
}

interface Props {
  planId: string;
  userId: string;
}

const DateSelector: React.FC<Props> = ({ planId, userId }) => {
  const db = getFirestore(firebaseApp);
  const [docs, setDocs] = useState<DateVoteDoc[]>([]);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  useEffect(() => {
    if (!planId) return;
    const q = collection(db, 'plans', planId, 'dateVotes');
    const unsub = onSnapshot(q, (snap) => {
      const d = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as DateVoteDoc[];
      setDocs(d);
    });
    return () => unsub();
  }, [db, planId]);

  const addRange = async () => {
    if (!newStart || !newEnd) return;
    const ref = doc(collection(db, 'plans', planId, 'dateVotes'));
    await setDoc(ref, { range: { start: newStart, end: newEnd }, votes: {} });
    setNewStart('');
    setNewEnd('');
  };

  const vote = async (id: string, value: VoteValue) => {
    const ref = doc(db, 'plans', planId, 'dateVotes', id);
    await setDoc(ref, { votes: { [userId]: value } }, { merge: true });
  };

  const aggregate = (votes: Record<string, VoteValue>) => {
    const result = { '\u25EF': 0, '\u25B3': 0, '\u2715': 0 } as Record<VoteValue, number>;
    Object.values(votes).forEach((v) => {
      result[v]++;
    });
    return result;
  };

  return (
    <div>
      <h3>Date Selection</h3>
      <div>
        <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
        <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
        <button onClick={addRange}>Add</button>
      </div>
      <ul>
        {docs.map((d) => {
          const agg = aggregate(d.votes || {});
          return (
            <li key={d.id} style={{ marginBottom: '1rem' }}>
              <div>{d.range.start} - {d.range.end}</div>
              <div>
                {(['\u25EF', '\u25B3', '\u2715'] as VoteValue[]).map((v) => (
                  <button key={v} onClick={() => vote(d.id, v)} style={{ marginRight: 4 }}>
                    {v}
                  </button>
                ))}
              </div>
              <div>
                {(['\u25EF', '\u25B3', '\u2715'] as VoteValue[]).map((v) => (
                  <span key={v} style={{ marginRight: 8 }}>{v}:{agg[v]}</span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DateSelector;
