import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase';
import { trackEvent } from '../../lib/analytics';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { usePlanStore } from '../../stores/planStore';
import HotelSuggester from '../booking/HotelSuggester';

const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px',
    border: '1px solid #ccc',
    marginBottom: '4px',
    background: '#fff',
  } as React.CSSProperties;

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
};

const Timeline: React.FC = () => {
  const { planId, spots, setSpots } = usePlanStore();
  const db = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp);
  const [segments, setSegments] = useState<any[]>([]);

  const parseTime = (str: string) => {
    const [h, m] = str.split(':').map((v) => parseInt(v, 10));
    return h * 60 + m;
  };

  const dayStart = 9 * 60; // 9:00
  let current = dayStart;
  const arrivalTimes: number[] = [];
  spots.forEach((s, idx) => {
    if (idx > 0 && segments[idx - 1]) {
      current += Math.round(segments[idx - 1].duration.value / 60);
    }
    arrivalTimes.push(current);
    current += s.stayTime ?? 60;
  });
  const totalMinutes = current - dayStart;
  const busy = totalMinutes > 600;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = spots.findIndex((s) => s.id === active.id);
    const newIndex = spots.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(spots, oldIndex, newIndex);
    setSpots(newOrder);

    if (!planId) return;
    const ref = doc(db, 'plans', planId);
    await updateDoc(ref, { spots: newOrder });
    trackEvent('timeline_reordered');

    if (newOrder.length > 1) {
      try {
        const fn = httpsCallable(functions, 'calculateRoute');
        const res: any = await fn({ placeIds: newOrder.map((s) => s.id) });
        setSegments(res.data.segments || []);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSegments([]);
    }
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkin = today.toISOString().slice(0, 10);
  const checkout = tomorrow.toISOString().slice(0, 10);

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {busy && (
          <div className="text-red-600 font-bold mb-2">この日は少し忙しいかも？</div>
        )}
        <SortableContext
          items={spots.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {spots.map((s, idx) => {
              const arrival = arrivalTimes[idx];
              const close = s.businessHours?.[0]?.close;
              const warn = close ? arrival > parseTime(close) : false;
              return (
                <React.Fragment key={s.id}>
                  <SortableItem id={s.id}>
                    <span className={warn ? 'bg-red-200' : undefined}>{s.name}</span>
                  </SortableItem>
                  {segments[idx] && (
                    <li className="ml-4 text-sm text-gray-700">{segments[idx].duration.text}</li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </SortableContext>
      </DndContext>
      {spots.length > 0 && (
        <div className="mt-4">
          <HotelSuggester
            location={spots[spots.length - 1].name}
            checkinDate={checkin}
            checkoutDate={checkout}
          />
        </div>
      )}
    </>
  );
};

export default Timeline;
