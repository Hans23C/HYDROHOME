import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Check, ChevronDown } from 'lucide-react';

export const DEFAULT_TECHNICAL_TEMPLATES = [
  'Fuga en válvula reguladora de presión en segundo piso',
  'Bomba BOM-003 con vibración anormal y presión baja (1.8 bar)',
  'Caudal irregular detectado en línea de distribución a laboratorios',
  'Goteo constante en llave de paso principal de módulo sanitario',
  'Mantenimiento preventivo periódico en electrobomba de impulsión',
  'Alerta de cavitación por posible entrada de aire en succión',
];

export const DEFAULT_ADMIN_TEMPLATES = [
  'Autorizada la sustitución del sello mecánico y limpieza de filtro en bodega central.',
  'Recibido y archivado. Reparado con cambio de empaque de teflón. Presión estabilizada.',
  'Proceder con corte programado de agua a las 14:00 para purgado de aire en circuito.',
  'Aprobado en bitácora técnica de operación mensual del campus.',
  'Se envía personal técnico de apoyo para revisión de presostato y válvulas check.',
];

export const NordAutocomplete = ({
  label,
  description,
  value,
  onChange,
  placeholder,
  templates = DEFAULT_TECHNICAL_TEMPLATES,
  required = false,
  rows = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setFilteredTemplates(templates);
    } else {
      const lower = value.toLowerCase();
      const filtered = templates.filter((t) => t.toLowerCase().includes(lower));
      setFilteredTemplates(filtered.length > 0 ? filtered : templates);
    }
  }, [value, templates]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (t) => {
    onChange(t);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      {/* Field Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center gap-1 transition"
        >
          <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" />
          <span>Plantillas Rápidas</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Field Description */}
      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-1">
          {description}
        </p>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-400 resize-none transition shadow-inner"
        />
      </div>

      {/* Menú Desplegable Autocomplete */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 liquid-glass p-2 border-sky-400/30 max-h-48 overflow-y-auto space-y-1 shadow-2xl">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Sugerencias predeterminadas
          </div>
          {filteredTemplates.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectTemplate(item)}
              className="w-full text-left p-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-sky-500/15 hover:text-sky-700 dark:hover:text-sky-200 transition flex items-start gap-2"
            >
              <Check className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
