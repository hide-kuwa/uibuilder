let currentLang = 'ja';
const dictionaries: Record<string, Record<string, string>> = {};
const listeners = new Set<() => void>();

export async function setLanguage(lang: string) {
  currentLang = lang;
  if (!dictionaries[lang]) {
    const res = await fetch(`/locales/${lang}.json`);
    dictionaries[lang] = await res.json();
  }
  listeners.forEach((l) => l());
}

export function t(key: string): string {
  const dict = dictionaries[currentLang] || {};
  return dict[key] ?? key;
}

export function getLanguage() {
  return currentLang;
}

export function registerKey(lang: string, key: string, value: string) {
  if (!dictionaries[lang]) dictionaries[lang] = {};
  dictionaries[lang][key] = value;
}

export function generateKey(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
