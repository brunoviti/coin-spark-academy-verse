
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en formato legible
 * @param dateString - Fecha en formato string (ISO)
 * @returns Fecha formateada en el formato local (dd/mm/yyyy)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
    return dateString;
  }
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Símbolo de moneda (opcional)
 * @returns Cadena formateada como moneda
 */
export function formatCurrency(amount: number, currency: string = ""): string {
  try {
    return `${currency}${amount.toLocaleString('es-ES')}`;
  } catch (error) {
    console.error('Error al formatear la moneda:', error);
    return `${currency}${amount}`;
  }
}

/**
 * Obtiene una representación abreviada de un nombre completo
 * @param fullName - Nombre completo
 * @returns Iniciales o nombre abreviado
 */
export function getInitials(fullName: string): string {
  if (!fullName) return "";
  
  const names = fullName.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  
  return fullName.substring(0, 2).toUpperCase();
}

/**
 * Genera un color aleatorio basado en un texto
 * @param text - Texto para generar el color
 * @returns Color en formato hex
 */
export function getRandomColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#4299E1', // blue-500
    '#48BB78', // green-500
    '#ED8936', // orange-500
    '#9F7AEA', // purple-500
    '#F56565', // red-500
    '#38B2AC', // teal-500
    '#667EEA', // indigo-500
    '#D69E2E'  // yellow-600
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
