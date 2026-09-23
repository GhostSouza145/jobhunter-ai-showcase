'use client';

import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

export function toast(input: { title: string; description?: string; variant?: ToastVariant }) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, variant: 'default', ...input }];
  emit();
  setTimeout(() => dismissToast(id), 5000);
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
