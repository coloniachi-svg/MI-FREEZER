/**
 * Formatting and parsing utilities for German and Spanish locales
 */

import { Categoria, LanguageCode } from '../types/freezer';
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

export function getCategoryEmoji(
  category: string | Categoria | any,
  categoriasList?: Categoria[]
): string {
  // 1. Direct emoji on category object
  if (typeof category === 'object' && category !== null) {
    if (category.Emoji || category.emoji) {
      return category.Emoji || category.emoji;
    }
  }

  const catStr = (
    typeof category === 'string'
      ? category
      : category?.nombre || category?.Categoria || ''
  ).trim();

  if (!catStr) return '❄️';

  // 2. Search in categoriasList if provided
  if (categoriasList && Array.isArray(categoriasList)) {
    const found = categoriasList.find(
      (c) =>
        (c.nombre && c.nombre.trim().toLowerCase() === catStr.toLowerCase()) ||
        (c.Categoria && c.Categoria.trim().toLowerCase() === catStr.toLowerCase())
    );
    if (found && (found.Emoji || found.emoji)) {
      return (found.Emoji || found.emoji) as string;
    }
  }

  // 3. Keyword-based default automatic emojis
  const cat = catStr.toLowerCase();
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
 * Recognizes automatic food emoji from name
 */
export function getAutoFoodEmojiByName(nameStr: string): string | null {
  const name = nameStr.toLowerCase().trim();
  if (!name) return null;

  if (name.includes('banana') || name.includes('banane') || name.includes('plátano') || name.includes('platano')) return '🍌';
  if (name.includes('apfel') || name.includes('äpfel') || name.includes('aepfel') || name.includes('manzana')) return '🍎';
  if (name.includes('erdbeer') || name.includes('frutilla') || name.includes('fresa')) return '🍓';
  if (name.includes('kirsch') || name.includes('cereza')) return '🍒';
  if (name.includes('zitrone') || name.includes('limon') || name.includes('limón')) return '🍋';
  if (name.includes('orange') || name.includes('naranja')) return '🍊';
  if (name.includes('traube') || name.includes('uva')) return '🍇';
  if (name.includes('beere') || name.includes('heidelbeer') || name.includes('himbeer') || name.includes('arandano') || name.includes('arándano') || name.includes('frambuesa') || name.includes('mora')) return '🫐';
  if (name.includes('brot') || name.includes('brötchen') || name.includes('broetchen') || name.includes('pan ') || name.endsWith('pan') || name.startsWith('pan') || name.includes('baguette') || name.includes('toast') || name.includes('zwieback')) return '🥖';
  if (name.includes('hähnchen') || name.includes('haehnchen') || name.includes('huhn') || name.includes('geflügel') || name.includes('gefluegel') || name.includes('pollo') || name.includes('pavo') || name.includes('pute')) return '🍗';
  if (name.includes('fleisch') || name.includes('carne') || name.includes('rind') || name.includes('schwein') || name.includes('steak') || name.includes('costilla') || name.includes('chuleta') || name.includes('lomo') || name.includes('bife') || name.includes('milanesa') || name.includes('hackfleisch') || name.includes('picada')) return '🥩';
  if (name.includes('wurst') || name.includes('würst') || name.includes('wuerst') || name.includes('chorizo') || name.includes('salchicha') || name.includes('salami') || name.includes('salchichón')) return '🌭';
  if (name.includes('fisch') || name.includes('pescado') || name.includes('lachs') || name.includes('salmón') || name.includes('salmon') || name.includes('thunfisch') || name.includes('atún') || name.includes('atun') || name.includes('forelle') || name.includes('trucha') || name.includes('merluza') || name.includes('seelachs')) return '🐟';
  if (name.includes('garnele') || name.includes('gamba') || name.includes('camarón') || name.includes('camaron') || name.includes('langostino') || name.includes('krabbe')) return '🍤';
  if (name.includes('karotte') || name.includes('möhre') || name.includes('moehre') || name.includes('mohrrübe') || name.includes('mohrruebe') || name.includes('zanahoria')) return '🥕';
  if (name.includes('mais') || name.includes('maíz') || name.includes('choclo')) return '🌽';
  if (name.includes('kartoffel') || name.includes('papa') || name.includes('patata')) return '🥔';
  if (name.includes('tomate') || name.includes('tomaten')) return '🍅';
  if (name.includes('pilz') || name.includes('champignon') || name.includes('hongo') || name.includes('seta')) return '🍄';
  if (name.includes('broccoli') || name.includes('brócoli') || name.includes('brocoli') || name.includes('spinat') || name.includes('espinaca') || name.includes('erbse') || name.includes('arveja') || name.includes('guisante')) return '🥦';
  if (name.includes('eis') || name.includes('helado') || name.includes('eiskrem')) return '🍦';
  if (name.includes('pizza')) return '🍕';
  if (name.includes('käse') || name.includes('kaese') || name.includes('queso')) return '🧀';
  if (name.includes('ei ') || name.includes('eier') || name.includes('huevo')) return '🥚';
  if (name.includes('milch') || name.includes('leche')) return '🥛';
  if (name.includes('suppe') || name.includes('sopa') || name.includes('eintopf') || name.includes('guiso') || name.includes('caldo')) return '🍲';
  if (name.includes('kuchen') || name.includes('torte') || name.includes('torta') || name.includes('pastel')) return '🍰';
  if (name.includes('schokolade') || name.includes('chocolate')) return '🍫';

  return null;
}

/**
 * Priority order for product emoji:
 * 1. Manual product custom emoji (if set)
 * 2. Automatic emoji recognized by product name
 * 3. Manual category custom emoji / Category emoji
 */
export function getProductEmoji(
  product: string | any,
  category?: string | any,
  customProductEmojiOverride?: string,
  categoriasList?: Categoria[]
): string {
  // 1. Explicit override or manual product emoji saved
  if (customProductEmojiOverride) return customProductEmojiOverride;

  if (typeof product === 'object' && product !== null) {
    if (product.Emoji || product.emoji) {
      return product.Emoji || product.emoji;
    }
  }

  const pName = (
    typeof product === 'string'
      ? product
      : product?.Producto || product?.nombre || ''
  ).trim();

  // 2. Automatic recognition by product name
  if (pName) {
    const autoEmoji = getAutoFoodEmojiByName(pName);
    if (autoEmoji) return autoEmoji;
  }

  // 3. Fallback to category emoji (which includes manual category emoji or default category emoji)
  return getCategoryEmoji(category, categoriasList);
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
