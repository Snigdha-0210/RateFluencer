import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function getViralityColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

export function getViralityBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 75) return "bg-blue-50 text-blue-700 border-blue-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function getGrowthColor(level: string): string {
  switch (level) {
    case "explosive": return "text-red-600";
    case "high": return "text-orange-600";
    case "moderate": return "text-blue-600";
    default: return "text-slate-500";
  }
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    "AI": "bg-violet-100 text-violet-700",
    "Technology": "bg-blue-100 text-blue-700",
    "Business": "bg-slate-100 text-slate-700",
    "Startups": "bg-orange-100 text-orange-700",
    "Finance": "bg-emerald-100 text-emerald-700",
    "Creator Economy": "bg-pink-100 text-pink-700",
    "Marketing": "bg-amber-100 text-amber-700",
    "Productivity": "bg-cyan-100 text-cyan-700",
  };
  return map[category] ?? "bg-slate-100 text-slate-700";
}
