import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function calculateDays(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    in_progress: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    available: "bg-green-500",
    booked: "bg-blue-500",
    maintenance: "bg-orange-500",
    unavailable: "bg-gray-500",
    scheduled: "bg-indigo-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    active: "bg-green-500",
    inactive: "bg-gray-500",
  };

  return statusColors[status] || "bg-gray-500";
}

export function getStatusBadgeClass(status: string): string {
  const baseClass =
    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider";
  const statusColor = getStatusColor(status);
  return `${baseClass} ${statusColor} text-white`;
}
