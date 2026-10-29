import React, { useState } from 'react';
import { Smile } from 'lucide-react';

export const EMOJI_PRESETS = [
  // Carnes y Pescados
  '🥩', '🍗', '🍖', '🥓', '🌭', '🍔', '🐟', '🦐', '🦞', '🦀', '🍣',
  // Panes y Farináceos
  '🥖', '🍞', '🥐', '🥯', '🥨', '🥪', '🍕', '🥧', '🎂', '🍰', '🍪', '🍩',
  // Verduras y Legumbres
  '🥦', '🥕', '🌽', '🧄', '🧅', '🥔', '🥑', '🫑', '🥒', '🥬', '🍅', '茄', '🍄', '🫛',
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
  label?: string;
}

export const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  value,
  onChange,
  defaultEmojiSuggestion = '❄️',
  label = 'Emoji',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayEmoji = value || defaultEmojiSuggestion;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-sky-600 hover:underline cursor-pointer"
          >
            Restablecer automático
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-10 rounded-xl bg-slate-50 border border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 flex items-center justify-center text-xl transition cursor-pointer shrink-0 shadow-2xs"
          title="Seleccionar emoji"
        >
          {displayEmoji}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Auto (${defaultEmojiSuggestion}) o escribe emoji`}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner mt-2 animate-in fade-in duration-100 max-h-40 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Elegir emoji rápido:
          </p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PRESETS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-sky-100 transition cursor-pointer ${
                  value === emoji ? 'bg-sky-200 ring-2 ring-sky-500' : 'bg-white/80'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
