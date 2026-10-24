/**
 * Formatting and parsing utilities for Spanish locale and freezer items
 */

export function parseDecimalInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Replace comma with period and strip invalid characters
  const sanitized = value.toString().trim().replace(',', '.');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCantidad(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'number' ? val : parseDecimalInput(val);
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatUnidad(cantidad: number, unidad: string): string {
  const formattedNum = formatCantidad(cantidad);
  const u = (unidad || '').toLowerCase().trim();

  if (u === 'unidad' || u === 'unidades' || u === 'u') {
    return cantidad === 1 ? `${formattedNum} unidad` : `${formattedNum} unidades`;
  }
  if (u === 'litro' || u === 'litros' || u === 'l') {
    return cantidad === 1 ? `${formattedNum} litro` : `${formattedNum} litros`;
  }
  if (u === 'kg' || u === 'kilo' || u === 'kilos') {
    return `${formattedNum} kg`;
  }
  if (u === 'g' || u === 'gramo' || u === 'gramos') {
    return `${formattedNum} g`;
  }
  return `${formattedNum} ${unidad}`;
}

export function getCategoryEmoji(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('carne') || cat.includes('pollo') || cat.includes('vaca') || cat.includes('cerdo') || cat.includes('pescado')) {
    return '🥩';
  }
  if (cat.includes('pan') || cat.includes('harina') || cat.includes('masa')) {
    return '🥖';
  }
  if (cat.includes('verdura') || cat.includes('vegetal') || cat.includes('hortaliza')) {
    return '🥦';
  }
  if (cat.includes('fruta') || cat.includes('baya')) {
    return '🍓';
  }
  if (cat.includes('comida') || cat.includes('preparad') || cat.includes('plato') || cat.includes('tupper') || cat.includes('guiso')) {
    return '🍲';
  }
  if (cat.includes('postre') || cat.includes('helado') || cat.includes('dulce')) {
    return '🍨';
  }
  if (cat.includes('marisco') || cat.includes('camar') || cat.includes('salmon')) {
    return '🦐';
  }
  if (cat.includes('salsa') || cat.includes('caldo')) {
    return '🥣';
  }
  if (cat.includes('lacteo') || cat.includes('queso') || cat.includes('manteca')) {
    return '🧀';
  }
  return '❄️';
}

export function formatDateSpanish(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return String(dateStr);
  }
}
