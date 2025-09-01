import { create } from 'zustand';

export interface BusinessHour {
  open: string;  // HH:mm
  close: string; // HH:mm
}

export interface Spot {
  id: string;
  name: string;
  stayTime?: number; // minutes
  businessHours?: BusinessHour[]; // length may be 7 or generic
  [key: string]: any;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
}

interface PlanState {
  planId?: string;
  spots: Spot[];
  expenses: Expense[];
  setPlanId: (id: string) => void;
  setSpots: (spots: Spot[]) => void;
  setExpenses: (expenses: Expense[]) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  planId: undefined,
  spots: [],
  expenses: [],
  setPlanId: (planId) => set({ planId }),
  setSpots: (spots) => set({ spots }),
  setExpenses: (expenses) => set({ expenses }),
}));
