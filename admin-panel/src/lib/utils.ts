import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDate(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('ne-NP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

export function formatDateNepali(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  // Nepali month names
  const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
  ];
  
  // Nepali day names
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 
    'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const dayOfWeek = dateObj.getDay();
  
  // Convert to Nepali date (approximate conversion)
  // This is a simplified conversion - for production use a proper Nepali calendar library
  const nepaliYear = year + 57; // Nepali calendar is approximately 57 years ahead
  
  return `${nepaliDays[dayOfWeek]} ${day} ${nepaliMonths[month]} ${nepaliYear} (${day}/${month + 1}/${year})`;
}

export function formatDateShort(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('ne-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

export function formatFiscalYear(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  
  // Nepali fiscal year runs from Shrawan (July) to Ashadh (June)
  // FY 2024-25 means from July 2024 to June 2025
  if (month >= 7) {
    return `FY ${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `FY ${(year - 1)}-${year.toString().slice(-2)}`;
  }
}

export function getNepaliMonthName(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
  ];
  
  return nepaliMonths[dateObj.getMonth()];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateEmployeeId(department: string): string {
  const deptCode = department.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${deptCode}${randomNum}`;
}

export function generateBillNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `BILL${year}${randomNum}`;
}

export function generateJournalNumber(): string {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `JE${year}${month}${randomNum}`;
}

export function calculateVATAmount(taxableAmount: number, vatRate: number): number {
  return (taxableAmount * vatRate) / 100;
}

export function getRoleDisplayName(role: string): string {
  const roleNames = {
    ADMIN: 'Administrator',
    MANAGERIAL: 'Managerial',
    SALES_MANAGER: 'Sales Manager',
    SALES_REPRESENTATIVE: 'Sales Representative',
    DISTRIBUTOR: 'Distributor'
  };
  return roleNames[role as keyof typeof roleNames] || role;
}

export function getStatusColor(status: string): string {
  const statusColors = {
    // Order statuses
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_production: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    
    // VAT Bill statuses
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    
    // Journal statuses
    posted: 'bg-green-100 text-green-800',
    
    // Production statuses
    scheduled: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800'
  };
  
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  
  return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
}

export function validatePAN(pan: string): boolean {
  // Simple PAN validation for Nepal (9 digits)
  const panRegex = /^\d{9}$/;
  return panRegex.test(pan);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // Simple phone validation (10 digits starting with 9)
  const phoneRegex = /^9\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}
