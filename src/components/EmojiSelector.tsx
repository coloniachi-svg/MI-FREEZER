import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const EMOJI_PRESETS = [
  // Carnes y Pescados
  '🥩', '🍗', '🍖', '🥓', '🌭', '🍔', '🐟', '🦐', '🦞', '🦀', '🍣',
  // Panes y Farináceos
  '🥖', '🍞', '🥐', '🥯', '🥨', '🥪', '🍕', '🥧', '🎂', '🍰', '🍪', '🍩',
  // Verduras y Legumbres
  '🥦', '🥕', '🌽', '🧄', '🧅', '🥔', '🥑', '🫑', '🥒', '🥬', '🍅', '🍄', '🫛',
  // Frutas
  '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥝',
  // Comidas y Preparados
  '🍲', '🥗', '🍝', '🍜', '🌮', '🌯', '🫔', '🥟', '🥫', '🥘', '🍱',
  // Lácteos, Helados y Dulces
  '🧀', '🥛', '🧈', '🥚', '🍨', '🍦', '🍫', '🍧', '🧊',
  // Bebidas y Varios
  '🧃', '☕', '🥤', '🍺', '🍷', '🍾', '🍯', '🫙', '❄️', '📦', '🏷️',
];

interface EmojiSelectorProps {
  value: string;
  onChange: (emoji: string) => void;
  defaultEmojiSuggestion?: string;
  defaultSymbol?: string;
  label?: string;
}

function extractSingleEmoji(raw?: string, fallback = '📦'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase().startsWith('auto')) return fallback;
  const chars = Array.from(trimmed);
  if (chars.length > 0) {
    return chars[0];
  }
  return fallback;
}

export const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  value,
  onChange,
  defaultEmojiSuggestion,
  defaultSymbol,
  label,
}) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const defaultIcon = extractSingleEmoji(defaultSymbol || defaultEmojiSuggestion, '📦');
  const displayEmoji = value && value.trim() ? Array.from(value.trim())[0] : defaultIcon;

  const defaultLabel = label || (lang === 'de' ? 'Produkt-Emoji (Optional)' : 'Emoji del producto (Opcional)');
  const placeholderText = lang === 'de' ? 'Auto (automatisch nach Name)' : 'Auto (automático según nombre)';

  return (
    <div className="relative space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {defaultLabel}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-medium text-sky-600 hover:text-sky-800 transition cursor-pointer"
          >
            {lang === 'de' ? 'Auto (zurücksetzen)' : 'Restablecer a automático'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 h-10">
        {/* Preview badge */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 flex items-center justify-center text-lg shrink-0 transition cursor-pointer shadow-2xs"
          title={lang === 'de' ? 'Emoji wählen' : 'Seleccionar emoji'}
        >
          <span>{displayEmoji}</span>
        </button>

        {/* Input field + picker toggle */}
        <div className="relative flex-1 flex items-center h-10">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-full pl-3 pr-10 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition truncate"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title={lang === 'de' ? 'Emoji wählen' : 'Seleccionar emoji'}
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Picker Panel */}
      {isOpen && (
        <div className="relative z-20 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-md mt-1.5 animate-in fade-in duration-100 max-h-36 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'de' ? 'Schnellauswahl Emoji:' : 'Elegir emoji rápido:'}
            </span>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[10px] font-semibold text-sky-600 hover:text-sky-800 transition cursor-pointer"
              >
                {lang === 'de' ? 'Auto (zurücksetzen)' : 'Auto (restablecer)'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PRESETS.map((emojiSymbol, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(emojiSymbol);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-sky-100 transition cursor-pointer ${
                  value === emojiSymbol ? 'bg-sky-200 ring-2 ring-sky-500' : 'bg-white/80'
                }`}
              >
                {emojiSymbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
