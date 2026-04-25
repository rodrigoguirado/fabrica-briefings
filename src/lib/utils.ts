import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (!value) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function getShareUrl(shareId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${shareId}`;
  }
  return `/share/${shareId}`;
}
