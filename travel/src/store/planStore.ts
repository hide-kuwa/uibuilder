import { create } from 'zustand';

export interface Plan {
  id: string;
  timeline: any[]; // TODO refine
}

interface PlanState {
  plan: Plan | null;
  setPlan: (plan: Plan) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plan: null,
  setPlan: (plan) => set({ plan }),
}));
