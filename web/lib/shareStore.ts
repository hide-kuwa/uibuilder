const store = new Map<string, any>();

export function save(data: any): string {
  const id = Math.random().toString(36).slice(2, 8);
  store.set(id, data);
  return id;
}

export function load(id: string) {
  return store.get(id);
}
