'use client';

import { useEffect, useState } from 'react'
import {
  doc,
  collection,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import Image from 'next/image'
import { db } from '../../../firebase'
import { usePlanStore } from '../../../stores/planStore'
import Timeline from '../../../components/itinerary/Timeline'
import InviteModal from '../../../components/InviteModal'
import BottomNav from '../../../components/BottomNav'
import ExpenseList from '../../../components/expenses/ExpenseList'
import ChatRoom from '../../../components/chat/ChatRoom'

const MapView = () => <div>Map Content</div>
const SettingsView = () => <div>Settings Content</div>

export default function Page({ params }: any) {
  const setPlanId = usePlanStore((s) => s.setPlanId)
  const setSpots = usePlanStore((s) => s.setSpots)
  const setExpenses = usePlanStore((s) => s.setExpenses)
  const [members, setMembers] = useState<string[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [activeNav, setActiveNav] = useState('timeline')
  const days = [1, 2, 3]

  const renderContent = () => {
    switch (activeNav) {
      case 'map':
        return <MapView />
      case 'chat':
        return <ChatRoom planId={params.planId} />
      case 'expense':
        return <ExpenseList planId={params.planId} />
      case 'settings':
        return <SettingsView />
      case 'timeline':
      default:
        return <Timeline />
    }
  }

  useEffect(() => {
    setPlanId(params.planId);
    const planRef = doc(db, 'plans', params.planId);
    const unsubPlan = onSnapshot(planRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      const data = snap.data();
      if (data) {
        if (Array.isArray(data.spots)) setSpots(data.spots);
        if (Array.isArray(data.members)) setMembers(data.members);
      }
    });

    const expensesRef = collection(db, 'plans', params.planId, 'expenses');
    const unsubExpenses = onSnapshot(expensesRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      const list = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        amount: d.data().amount,
        description: d.data().description,
        paidBy: d.data().paidBy,
      }));
      setExpenses(list);
    });

    return () => {
      unsubPlan();
      unsubExpenses();
    };
  }, [params.planId, setPlanId, setSpots, setExpenses]);

  return (
    <div className="pb-20">
      <div className="relative h-48 w-full">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          alt="cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-white">
          <h1 className="text-xl font-bold">TRAVEL to Tochigi</h1>
          <p className="text-sm">2024/01/01 - 2024/01/03</p>
          <div className="text-xs space-x-2 mt-1">
            <span>#2泊3日</span>
            <span>#家族旅行</span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            {members.slice(0, 5).map((m) => (
              <div
                key={m}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs"
              >
                {m[0]}
              </div>
            ))}
            <button
              onClick={() => setInviteOpen(true)}
              className="ml-auto px-3 py-1 rounded bg-primary text-white text-xs"
            >
              メンバーを招待・共有
            </button>
          </div>
        </div>
      </div>
      <div className="-mt-4 rounded-t-3xl bg-white p-4 text-text-primary">
        <div className="mb-4 flex space-x-2">
          {days.map((d, idx) => (
            <button
              key={d}
              onClick={() => setSelectedDay(idx)}
              className={`px-3 py-1 rounded-full ${selectedDay === idx ? 'bg-primary text-white' : 'bg-secondary text-text-secondary'}`}
            >
              Day {d}
            </button>
          ))}
        </div>
        {renderContent()}
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <BottomNav active={activeNav} setActive={setActiveNav} />
    </div>
  )
}
