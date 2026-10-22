/**
 * SoftFlow Design System - Design Tokens & Theme Definitions
 * Inspired by Linear's clarity, Monday.com's flexibility, and Notion's structure.
 */
import { TaskStatus, TaskPriority } from '../types';

export type ThemeMode = 'dark' | 'light';

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#0066ff', // Sophisticated primary blue
      600: '#0052cc',
      700: '#003d99',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  typography: {
    fontFamilySans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', monospace",
  },
} as const;

export interface StatusStyleConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const STATUS_STYLES: Record<string, StatusStyleConfig> = {
  'Pronto': {
    label: 'Pronto',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  'Trabalhando nisso': {
    label: 'Trabalhando nisso',
    bg: 'bg-amber-500/15 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  'Em andamento': {
    label: 'Em andamento',
    bg: 'bg-blue-500/15 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  'Em Revisão': {
    label: 'Em Revisão',
    bg: 'bg-purple-500/15 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
  },
  'Parado': {
    label: 'Parado',
    bg: 'bg-rose-500/15 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  'A Fazer': {
    label: 'A Fazer',
    bg: 'bg-slate-500/15 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
  'Bloqueado': {
    label: 'Bloqueado',
    bg: 'bg-red-500/15 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
  },
  'Novo': {
    label: 'Novo',
    bg: 'bg-slate-500/15 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

export interface PriorityStyleConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const PRIORITY_STYLES: Record<string, PriorityStyleConfig> = {
  'Crítica': {
    label: 'Crítica',
    bg: 'bg-rose-500/15 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  'Alta': {
    label: 'Alta',
    bg: 'bg-purple-500/15 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
  },
  'Média': {
    label: 'Média',
    bg: 'bg-blue-500/15 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  'Baixa': {
    label: 'Baixa',
    bg: 'bg-cyan-500/15 dark:bg-cyan-500/20',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  'Nenhuma': {
    label: 'Nenhuma',
    bg: 'bg-slate-500/15 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
};
