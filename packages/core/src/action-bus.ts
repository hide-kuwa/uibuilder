export type AppEvent =
  | { type: "COMPONENT_EVENT"; nodeId?: string; event: string; payload?: any }
  | { type: "NAVIGATE"; path: string }
  | { type: "OPEN_TAB"; componentId: string; props?: any; title?: string };

type Listener = (e: AppEvent) => void;
const listeners = new Set<Listener>();

export const ActionBus = {
  emit: (e: AppEvent) => {
    for (const l of listeners) l(e);
  },
  on: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
