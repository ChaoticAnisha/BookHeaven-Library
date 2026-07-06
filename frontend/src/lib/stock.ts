export const LOW_STOCK_THRESHOLD = 2;

export type StockLevel = "out" | "low" | "in";

export function getStockLevel(hardCopyCount: number): StockLevel {
  if (hardCopyCount <= 0) return "out";
  if (hardCopyCount <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export const stockDotClass: Record<StockLevel, string> = {
  out: "bg-red-500",
  low: "bg-amber-500 animate-pulse",
  in: "bg-green-500",
};

export const stockTextClass: Record<StockLevel, string> = {
  out: "text-red-600",
  low: "text-amber-600",
  in: "text-emerald-600",
};
