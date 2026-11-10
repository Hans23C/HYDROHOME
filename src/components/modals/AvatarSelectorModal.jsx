import React, { useState } from 'react';
import { X, Sparkles, Check, RefreshCw, Wand2 } from 'lucide-react';
import { useAuth, DICEBEAR_COLLECTIONS, getDicebearAvatarUrl } from '../../context/AuthContext';

export const AvatarSelectorModal = ({ isOpen, onClose }) => {
  const { user, updateAvatar, addToast } = useAuth();

  const [activeTab, setActiveTab] = useState(user?.avatarStyle || 'voxel-bot');
  const [selectedSeed, setSelectedSeed] = useState(user?.avatarSeed || 'AdminVoxel');
  const [customSeedInput, setCustomSeedInput] = useState('');

  if (!isOpen) return null;

  const currentCollection = DICEBEAR_COLLECTIONS[activeTab] || DICEBEAR_COLLECTIONS['voxel-bot'];

  const handleSelectSeed = (seed) => {
    setSelectedSeed(seed);
  };

  const handleApplyCustomSeed = (e) => {
    e.preventDefault();
    if (customSeedInput.trim()) {
      setSelectedSeed(customSeedInput.trim());
      setCustomSeedInput('');
    }
  };

  const handleRandomSeed = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const newSeed = `${activeTab}-${randomSuffix}`;
    setSelectedSeed(newSeed);
  };

  const handleSave = () => {
    updateAvatar(activeTab, selectedSeed);
    addToast({
      title: 'Avatar Actualizado',
      message: `Estilo: ${currentCollection.name} (${selectedSeed})`,
      variant: 'success',
      duration: 3500,
    });
    onClose();
  };

  const currentPreviewUrl = getDicebearAvatarUrl(activeTab, selectedSeed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Personalizador de Avatar Oficial
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona entre 4 colecciones vectoriales DiceBear 10.x
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preview Activo */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950/80 to-slate-900/80 border border-cyan-500/30">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full ring-4 ring-cyan-500/50 p-1.5 bg-slate-800 shadow-xl shadow-cyan-500/20 flex items-center justify-center overflow-hidden animate-cyber-ring">
                <img
                  src={currentPreviewUrl}
                  alt="Vista previa del avatar"
                  className="w-full h-full object-contain animate-avatar-float animate-avatar-glow"
                  loading="lazy"
                />
              </div>
              <span className="absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950 shadow">
                EN VIVO
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Colección: {currentCollection.name}
                </span>
                {currentCollection.isAnimated && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    ⚡ ANIMADO
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Semilla: <span className="text-cyan-300 font-mono">{selectedSeed}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">{currentCollection.description}</p>
            </div>

            <button
              onClick={handleRandomSeed}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0 cursor-pointer"
              title="Generar avatar aleatorio"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aleatorio</span>
            </button>
          </div>

          {/* Selector de Colección (6 estilos) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Selecciona la Colección (Incluye Pixelbot e Initial-Face Animados)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.entries(DICEBEAR_COLLECTIONS).map(([key, col]) => {
                const isSelected = activeTab === key;
                const sampleUrl = `${col.url}?seed=${col.seeds[0]}&radius=50`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveTab(key);
                      setSelectedSeed(col.seeds[0]);
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 mb-2 border border-slate-700 flex items-center justify-center">
                      <img
                        src={sampleUrl}
                        alt={col.name}
                        className={`w-full h-full object-contain ${
                          col.isAnimated || isSelected ? 'animate-avatar-float' : ''
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight">{col.name}</span>
                    {col.isAnimated && (
                      <span className="text-[9px] font-mono text-emerald-400 mt-0.5">
                        ● Animado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semillas Predeterminadas del Estilo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Elige un modelo de {currentCollection.name}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {currentCollection.seeds.map((seed) => {
                const isSeedActive = selectedSeed === seed;
                const seedUrl = `${currentCollection.url}?seed=${encodeURIComponent(seed)}&radius=50`;
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => handleSelectSeed(seed)}
                    className={`relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSeedActive
                        ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20 scale-105'
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {isSeedActive && (
                      <span className="absolute -top-1.5 -right-1.5 p-0.5 bg-cyan-500 rounded-full text-slate-950">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-900/80 mb-1.5">
                      <img src={seedUrl} alt={seed} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                      {seed}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generador con Semilla Personalizada */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              3. ¿Quieres una semilla personalizada?
            </label>
            <form onSubmit={handleApplyCustomSeed} className="flex gap-2">
              <input
                type="text"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                placeholder="Escribe tu apodo, zona o clave (ej. BombaCafeteria)"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 transition-all shrink-0"
              >
                Generar
              </button>
            </form>
          </div>
        </div>

        {/* Barra de Acciones */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Guardar Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectorModal;
