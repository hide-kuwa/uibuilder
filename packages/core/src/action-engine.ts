import { ActionBus } from "./action-bus";
import { callEndpoint } from "@data";

export type Action =
  | { type: "NAVIGATE"; path: string }
  | { type: "TOAST"; message: string; kind?: "success" | "error" | "info" }
  | { type: "OPEN_TAB"; componentId: string; props?: any; title?: string }
  | { type: "CALL_API"; endpointId: string; params?: any; body?: any; storeAs?: string }
  | { type: "MUTATE"; endpointId: string; params?: any; body?: any; successToast?: string }
  | { type: "RUN_DECISION"; key: string; input: any; storeAs?: string };

const ctx = new Map<string, any>();

export async function runActions(actions: Action[]) {
  for (const a of actions) {
    if (a.type === "NAVIGATE") {
      ActionBus.emit({ type: "NAVIGATE", path: a.path });
    } else if (a.type === "TOAST") {
      console.log(`[toast:${a.kind ?? "info"}] ${a.message}`);
    } else if (a.type === "OPEN_TAB") {
      ActionBus.emit({ type: "OPEN_TAB", componentId: a.componentId, props: a.props ?? {}, title: a.title });
    } else if (a.type === "CALL_API") {
      const res = await callEndpoint(a.endpointId, { params: a.params, body: a.body });
      if (a.storeAs) ctx.set(a.storeAs, res);
    } else if (a.type === "MUTATE") {
      const res = await callEndpoint(a.endpointId, { params: a.params, body: a.body });
      if (a.successToast) console.log(`[toast:success] ${a.successToast}`);
    } else if (a.type === "RUN_DECISION") {
      const res = await callEndpoint("dmn.run", { params: { key: a.key }, body: a.input });
      if (a.storeAs) ctx.set(a.storeAs, res);
    }
  }
}
