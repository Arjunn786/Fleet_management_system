export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};

export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    approved: "bg-green-500",
    in_progress: "bg-purple-500",
    completed: "bg-green-600",
    cancelled: "bg-red-500",
    rejected: "bg-red-600",
    available: "bg-green-500",
    unavailable: "bg-gray-500",
    maintenance: "bg-orange-500",
    scheduled: "bg-indigo-500",
    active: "bg-green-500",
    inactive: "bg-gray-500",
  };

  return colors[status] || "bg-gray-500";
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
