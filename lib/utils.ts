import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "USD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date));
}

/** Splits a subscription's monthly price evenly across owner + members. */
export function computeSeatPrice(monthlyPrice: number, totalSeats: number) {
  if (totalSeats <= 0) return monthlyPrice;
  return Math.round((monthlyPrice / totalSeats) * 100) / 100;
}
