/**
 * Formatting and parsing utilities for German and Spanish locales
 */

import { LanguageCode } from '../types/freezer';
import { translateUnitName } from '../i18n/translations';

export function parseDecimalInput(value: string | number | undefined | null): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Replace comma with period and strip whitespace
  const sanitized = value.toString().trim().replace(',', '.');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCantidad(
  val: number | string | undefined | null,
  lang: LanguageCode = 'de'
): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'number' ? val : parseDecimalInput(val);
  const locale = lang === 'de' ? 'de-DE' : 'es-ES';
  return num.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatUnidad(
  cantidad: number,
  unidad: string,
  lang: LanguageCode = 'de'
): string {
  const formattedNum = formatCantidad(cantidad, lang);
  const u = translateUnitName(unidad, cantidad, lang);
  return `${formattedNum} ${u}`;
}

export function getCategoryEmoji(category: string | any): string {
  const cat = (typeof category === 'string' ? category : (category?.nombre || category?.Categoria || '')).toLowerCase();
  if (
    cat.includes('carne') ||
    cat.includes('fleisch') ||
    cat.includes('pollo') ||
    cat.includes('hähnchen') ||
    cat.includes('huhn') ||
    cat.includes('rind') ||
    cat.includes('schwein') ||
    cat.includes('vaca') ||
    cat.includes('cerdo') ||
    cat.includes('pescado') ||
    cat.includes('fisch')
  ) {
    return '🥩';
  }
  if (
    cat.includes('pan') ||
    cat.includes('backware') ||
    cat.includes('brot') ||
    cat.includes('harina') ||
    cat.includes('masa') ||
    cat.includes('brötchen')
  ) {
    return '🥖';
  }
  if (
    cat.includes('verdura') ||
    cat.includes('gemüse') ||
    cat.includes('gemuse') ||
    cat.includes('vegetal') ||
    cat.includes('spinat') ||
    cat.includes('hortaliza')
  ) {
    return '🥦';
  }
  if (
    cat.includes('fruta') ||
    cat.includes('obst') ||
    cat.includes('baya') ||
    cat.includes('beeren') ||
    cat.includes('erdbeere')
  ) {
    return '🍓';
  }
  if (
    cat.includes('comida') ||
    cat.includes('fertiggericht') ||
    cat.includes('gericht') ||
    cat.includes('preparad') ||
    cat.includes('plato') ||
    cat.includes('tupper') ||
    cat.includes('guiso') ||
    cat.includes('eintopf')
  ) {
    return '🍲';
  }
  if (
    cat.includes('postre') ||
    cat.includes('dessert') ||
    cat.includes('helado') ||
    cat.includes('eis') ||
    cat.includes('dulce')
  ) {
    return '🍨';
  }
  if (
    cat.includes('marisco') ||
    cat.includes('meeresfrüchte') ||
    cat.includes('camar') ||
    cat.includes('garnelen') ||
    cat.includes('salmon')
  ) {
    return '🦐';
  }
  if (
    cat.includes('salsa') ||
    cat.includes('soße') ||
    cat.includes('sauce') ||
    cat.includes('caldo') ||
    cat.includes('brühe')
  ) {
    return '🥣';
  }
  if (
    cat.includes('lacteo') ||
    cat.includes('milch') ||
    cat.includes('queso') ||
    cat.includes('käse') ||
    cat.includes('butter')
  ) {
    return '🧀';
  }
  return '❄️';
}

/**
 * Formats date based on locale:
 * Deutsch: DD.MM.YYYY [HH:mm]
 * Español: DD/MM/YYYY [HH:mm]
 */
export function formatDate(
  dateStr: string | Date | undefined,
  lang: LanguageCode = 'de',
  includeTime = true
): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const sep = lang === 'de' ? '.' : '/';
    const dateFormatted = `${day}${sep}${month}${sep}${year}`;

    if (!includeTime) {
      return dateFormatted;
    }
    return `${dateFormatted} ${hours}:${minutes}`;
  } catch {
    return String(dateStr);
  }
}

// Backward compatibility alias
export const formatDateSpanish = (dateStr: string | Date | undefined) =>
  formatDate(dateStr, 'es', true);
