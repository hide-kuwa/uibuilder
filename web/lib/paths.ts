export const map = (pref: string) => `/map/${encodeURIComponent(pref)}`;
export const s = (pe: string) => `/s/${encodeURIComponent(pe)}`;
export const s_p = (p: string) => `/s/p/${encodeURIComponent(p)}`;
export const u = (uid: string) => `/u/${encodeURIComponent(uid)}`;
export const u_m = (uid: string, mapId: string) => `/u/${encodeURIComponent(uid)}/m/${encodeURIComponent(mapId)}`;
