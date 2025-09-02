export const newId = (p = 'n') => `${p}_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
