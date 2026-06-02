export const calculatePenalty = (dueDate: Date, returnDate: Date = new Date(), ratePerDay = 0.5): number => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);
  
  if (returned <= due) return 0;
  const diffMs = returned.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.round(diffDays * ratePerDay * 100) / 100;
};

export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > new Date(dueDate);
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const generateOrderId = (): string => {
  return `BH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};
