import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const supabaseConfigured = Boolean(url && publishableKey);
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  publishableKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

export function toDbRow<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => {
    const column = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const nullableDateColumns = new Set(['start_date', 'end_date', 'due_date']);
    return [column, nullableDateColumns.has(column) && item === '' ? null : item];
  }));
}

export function fromDbRow<T>(value: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()), item
  ])) as T;
}

export function newId(): string {
  return crypto.randomUUID();
}
