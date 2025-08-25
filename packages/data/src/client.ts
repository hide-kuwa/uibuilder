import { z } from "zod";
import { endpoints } from "./registry";

function buildPath(path: string, params?: any) {
  if (!params) return path;
  return path.replace(/:([a-zA-Z_]\w*)/g, (_, k) =>
    encodeURIComponent(params[k] ?? "")
  );
}

function toQuery(obj: any) {
  const q = new URLSearchParams();
  Object.entries(obj ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function callEndpoint(id: string, { params, body }: { params?: any; body?: any } = {}) {
  const ep = endpoints[id];
  if (!ep) throw new Error(`Unknown endpoint: ${id}`);

  const url = buildPath(ep.path, params) + (ep.method === "GET" ? toQuery(params) : "");
  const init: RequestInit = {
    method: ep.method,
    headers: { "Content-Type": "application/json" },
  };
  if (ep.method !== "GET" && body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return ep.respSchema.parse(json);
}

export function pickPath(obj: any, path?: string) {
  if (!path) return obj;
  const toks = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  return toks.reduce((acc, t) => (acc == null ? acc : acc[t]), obj);
}
