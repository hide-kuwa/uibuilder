'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadSnapshots, type Snapshot, type SnapshotNode } from '@/lib/snapshots';
import type { OverlayConfig, StatusConfig } from '@/types/status';

function diffNodes(a: Snapshot, b: Snapshot) {
  const mapA = new Map(a.nodes.map((n) => [n.id, n]));
  const mapB = new Map(b.nodes.map((n) => [n.id, n]));
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);
  const res: { id: string; type: string; before?: SnapshotNode; after?: SnapshotNode }[] = [];
  ids.forEach((id) => {
    const na = mapA.get(id);
    const nb = mapB.get(id);
    if (!na && nb) res.push({ id, type: 'added', after: nb });
    else if (na && !nb) res.push({ id, type: 'removed', before: na });
    else if (
      na &&
      nb &&
      (na.x !== nb.x || na.y !== nb.y || na.w !== nb.w || na.h !== nb.h)
    ) {
      res.push({ id, type: 'changed', before: na, after: nb });
    }
  });
  return res;
}

function arrayEqual(a: readonly string[] = [], b: readonly string[] = []) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function diffStatuses(a: Snapshot, b: Snapshot) {
  const ids = new Set([
    ...Object.keys(a.statuses || {}),
    ...Object.keys(b.statuses || {}),
  ]);
  const res: {
    id: string;
    baseA: string | undefined;
    baseB: string | undefined;
    overlaysA: string[] | undefined;
    overlaysB: string[] | undefined;
    type: string;
  }[] = [];
  ids.forEach((id) => {
    const sa = a.statuses[id];
    const sb = b.statuses[id];
    if (!sa && sb) {
      res.push({
        id,
        type: 'added',
        baseA: undefined,
        baseB: sb.base,
        overlaysA: undefined,
        overlaysB: sb.overlays,
      });
    } else if (sa && !sb) {
      res.push({
        id,
        type: 'removed',
        baseA: sa.base,
        baseB: undefined,
        overlaysA: sa.overlays,
        overlaysB: undefined,
      });
    } else if (sa && sb) {
      const baseDiff = sa.base !== sb.base;
      const overlaysDiff = !arrayEqual(sa.overlays, sb.overlays);
      if (baseDiff || overlaysDiff) {
        res.push({
          id,
          type: 'changed',
          baseA: sa.base,
          baseB: sb.base,
          overlaysA: sa.overlays,
          overlaysB: sb.overlays,
        });
      }
    }
  });
  return res;
}

function diffStatusConfig(a: StatusConfig, b: StatusConfig) {
  const res: { key: string; field: string; a: any; b: any }[] = [];
  const baseKeys = new Set([...Object.keys(a.base), ...Object.keys(b.base)]);
  baseKeys.forEach((k) => {
    const ca = a.base[k as keyof typeof a.base];
    const cb = b.base[k as keyof typeof b.base];
    if (ca?.color !== cb?.color) {
      res.push({ key: `base.${k}`, field: 'color', a: ca?.color, b: cb?.color });
    }
  });
  const mapOverlay = (cfg: StatusConfig) => {
    const m = new Map<string, OverlayConfig>();
    cfg.overlays.forEach((o) => m.set(o.key, o));
    return m;
  };
  const mapA = mapOverlay(a);
  const mapB = mapOverlay(b);
  const overlayKeys = new Set([...mapA.keys(), ...mapB.keys()]);
  overlayKeys.forEach((k) => {
    const oa = mapA.get(k);
    const ob = mapB.get(k);
    if (oa?.color !== ob?.color)
      res.push({ key: `overlays.${k}`, field: 'color', a: oa?.color, b: ob?.color });
    if (oa?.priority !== ob?.priority)
      res.push({ key: `overlays.${k}`, field: 'priority', a: oa?.priority, b: ob?.priority });
    if (oa?.mode !== ob?.mode)
      res.push({ key: `overlays.${k}`, field: 'mode', a: oa?.mode, b: ob?.mode });
  });
  return res;
}

export default function SnapshotDiffPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [aIndex, setAIndex] = useState<number>(-1);
  const [bIndex, setBIndex] = useState<number>(-1);

  useEffect(() => {
    setSnapshots(loadSnapshots());
  }, []);

  const snapA = snapshots[aIndex];
  const snapB = snapshots[bIndex];

  const nodeDiff = snapA && snapB ? diffNodes(snapA, snapB) : [];
  const statusDiff = snapA && snapB ? diffStatuses(snapA, snapB) : [];
  const configDiff = snapA && snapB ? diffStatusConfig(snapA.statusConfig, snapB.statusConfig) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/snapshot-diff</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="flex gap-3">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={aIndex}
            onChange={(e) => setAIndex(Number(e.target.value))}
          >
            <option value={-1}>Snapshot A</option>
            {snapshots.map((s, i) => (
              <option key={s.at + '-' + i} value={i}>
                {new Date(s.at).toLocaleString()}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={bIndex}
            onChange={(e) => setBIndex(Number(e.target.value))}
          >
            <option value={-1}>Snapshot B</option>
            {snapshots.map((s, i) => (
              <option key={s.at + '-' + i} value={i}>
                {new Date(s.at).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {snapA && snapB && (
          <div className="space-y-8">
            <section>
              <h2 className="font-semibold mb-2">nodes</h2>
              <table className="table-auto text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">id</th>
                    <th className="border px-2 py-1 text-left">type</th>
                    <th className="border px-2 py-1 text-left">A</th>
                    <th className="border px-2 py-1 text-left">B</th>
                  </tr>
                </thead>
                <tbody>
                  {nodeDiff.map((d) => (
                    <tr key={d.id}>
                      <td className="border px-2 py-1">{d.id}</td>
                      <td className="border px-2 py-1">{d.type}</td>
                      <td className="border px-2 py-1">
                        {d.before
                          ? `x:${d.before.x} y:${d.before.y} w:${d.before.w} h:${d.before.h}`
                          : '-'}
                      </td>
                      <td className="border px-2 py-1">
                        {d.after
                          ? `x:${d.after.x} y:${d.after.y} w:${d.after.w} h:${d.after.h}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-semibold mb-2">statuses</h2>
              <table className="table-auto text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">id</th>
                    <th className="border px-2 py-1 text-left">type</th>
                    <th className="border px-2 py-1 text-left">base A</th>
                    <th className="border px-2 py-1 text-left">base B</th>
                    <th className="border px-2 py-1 text-left">overlays A</th>
                    <th className="border px-2 py-1 text-left">overlays B</th>
                  </tr>
                </thead>
                <tbody>
                  {statusDiff.map((d) => (
                    <tr key={d.id}>
                      <td className="border px-2 py-1">{d.id}</td>
                      <td className="border px-2 py-1">{d.type}</td>
                      <td className="border px-2 py-1">{d.baseA ?? '-'}</td>
                      <td className="border px-2 py-1">{d.baseB ?? '-'}</td>
                      <td className="border px-2 py-1">
                        {d.overlaysA ? d.overlaysA.join(',') : '-'}
                      </td>
                      <td className="border px-2 py-1">
                        {d.overlaysB ? d.overlaysB.join(',') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-semibold mb-2">statusConfig</h2>
              <table className="table-auto text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">key</th>
                    <th className="border px-2 py-1 text-left">field</th>
                    <th className="border px-2 py-1 text-left">A</th>
                    <th className="border px-2 py-1 text-left">B</th>
                  </tr>
                </thead>
                <tbody>
                  {configDiff.map((d) => (
                    <tr key={d.key + d.field}>
                      <td className="border px-2 py-1">{d.key}</td>
                      <td className="border px-2 py-1">{d.field}</td>
                      <td className="border px-2 py-1">{d.a ?? '-'}</td>
                      <td className="border px-2 py-1">{d.b ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

