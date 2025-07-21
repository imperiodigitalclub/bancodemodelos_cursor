import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ============================================
// 🔧 HELPERS PARA CAMPO NAME - SUBSTITUÍDO POR FIRST_NAME + LAST_NAME
// ============================================

/**
 * Retorna nome completo do perfil concatenando first_name + last_name
 * Fallback para email ou 'Usuário' se nomes não estiverem disponíveis
 */
export const getFullName = (profile) => {
    if (!profile) return 'Usuário';
    
    const firstName = profile.first_name?.trim() || '';
    const lastName = profile.last_name?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Retorna nome completo, ou email, ou 'Usuário'
    return fullName || profile.email || 'Usuário';
};

/**
 * Retorna iniciais do perfil baseado em first_name + last_name
 * Fallback para primeira letra do email ou 'U'
 */
export const getInitials = (profile) => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name?.trim() || '';
    const lastName = profile.last_name?.trim() || '';
    const email = profile.email || '';
    
    // Iniciais de nome e sobrenome
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    // Apenas inicial do primeiro nome
    if (firstName) {
        return firstName.charAt(0).toUpperCase();
    }
    
    // Inicial do email
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    
    return 'U';
};

/**
 * Retorna nome para seed de avatar (usado em dicebear)
 * Prioriza first_name, depois email, depois ID
 */
export const getAvatarSeed = (profile) => {
    if (!profile) return 'default';
    
    const firstName = profile.first_name?.trim();
    if (firstName) return firstName;
    
    if (profile.email) return profile.email;
    
    if (profile.id) return profile.id;
    
    return 'default';
};

export function formatCurrencyInput(value) {
    if (typeof value !== 'string' || value === '') return '';
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    const number = Number(numericValue) / 100;
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function unformatCurrency(formattedValue) {
    if (typeof formattedValue !== 'string' || formattedValue === '') return 0;
    const numericString = formattedValue.replace(/\D/g, '');
    if (numericString === '') return 0;
    return Number(numericString) / 100;
}

export function formatPhoneNumber(phoneNumberString) {
  if (!phoneNumberString) return "";
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  if (cleaned.length > 11) {
    return cleaned.slice(0, 11); 
  }
  
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

export function formatInstagramHandle(handle) {
  if (!handle) return "";
  let cleanedHandle = handle.trim().replace(/^@/, '');
  try {
    const url = new URL(handle);
    if (url.hostname.includes('instagram.com')) {
      cleanedHandle = url.pathname.split('/').filter(Boolean)[0];
    }
  } catch (e) {
    // Not a valid URL
  }
  
  cleanedHandle = cleanedHandle.replace(/[^a-zA-Z0-9_.]/g, '');
  cleanedHandle = cleanedHandle.replace(/^\.+|\.+$/g, '');
  cleanedHandle = cleanedHandle.replace(/\.{2,}/g, '.');
  
  return cleanedHandle;
}