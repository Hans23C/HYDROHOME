import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Check, ArrowRight, ChevronDown, Sparkles, User, Mail, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarUsuario } from '../components/common/AvatarUsuario';

// 1. Componente Modular: Squircle de Avatar con Disparador de Cámara
export const InsigniaAvatarPerfil = ({ onOpenSelector }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-1 pb-3">
      <div
        className="relative group cursor-pointer"
        onClick={onOpenSelector}
        title="Toca para cambiar avatar 3D"
      >
        <div className="w-28 h-28 rounded-[32px] overflow-hidden shadow-xl bg-gradient-to-br from-[#07131F] via-[#0E1A29] to-[#0A2540] p-1 flex items-center justify-center relative border border-white/20 group-hover:scale-105 transition-all">
          <AvatarUsuario size="xl" className="w-full h-full rounded-[28px]" />
          {/* Overlay de Cámara translúcido idéntico al mockup */}
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] rounded-[30px] flex items-center justify-center transition-all group-hover:bg-black/20">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenSelector}
        className="text-xs font-bold text-[#00C2FF] mt-2.5 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Personalizar Avatar 3D</span>
      </button>
    </div>
  );
};

// 2. Componente Modular: Campo de Entrada Flotante Reutilizable
export const CampoEntradaFlotante = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`floating-input-box focus-within:!border-[#00C2FF] focus-within:!ring-2 focus-within:!ring-[#00C2FF]/15 ${className}`}>
      <label className="floating-input-label">{label}</label>
      {children || (
        <input
          type={type}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
        />
      )}
    </div>
  );
};

// 3. Componente Modular: Entrada de Teléfono con Bandera y Verificación
export const CampoVerificacionTelefono = ({
  countryFlag,
  phonePrefix,
  phoneNumber,
  onToggleCountry,
  onChangeNumber,
}) => {
  return (
    <div className="floating-input-box focus-within:!border-[#00C2FF] focus-within:!ring-2 focus-within:!ring-[#00C2FF]/15 flex items-center justify-between">
      <label className="floating-input-label">Phone Number</label>
      <div className="flex items-center gap-2.5 flex-1">
        <button
          type="button"
          onClick={onToggleCountry}
          className="text-lg select-none hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          title="Cambiar país"
        >
          {countryFlag}
        </button>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 select-none">
          {phonePrefix}
        </span>
        <input
          type="tel"
          value={phoneNumber}
          onChange={onChangeNumber}
          className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
          placeholder="999 999 999"
        />
      </div>
      <div 
        className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
        title="Número verificado para alertas de agua"
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </div>
  );
};

// 4. Componente Principal de la Pantalla: PantallaEditarAvatar
export const PantallaEditarAvatar = ({
  onBack,
  onChangePassword,
  onOpenAvatarSelector,
}) => {
  const { user, activeSystem, updateUserProfile, addToast } = useAuth();

  const [fullName, setFullName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Hannah Turin'
  );
  const [email, setEmail] = useState(user?.email || 'hannah.turin@email.com');
  const [phonePrefix, setPhonePrefix] = useState('(+1)');
  const [phoneNumber, setPhoneNumber] = useState('999 999 999');
  const [countryFlag, setCountryFlag] = useState('🇺🇸');
  const [address, setAddress] = useState(
    user?.address || activeSystem?.address || '907 Valley Drive, Allentown'
  );
  const [zipCode, setZipCode] = useState(user?.zipCode || '18109');
  const [stateName, setStateName] = useState(user?.stateName || 'Pennsylvania');
  const [password] = useState('••••••');
  const [isSaving, setIsSaving] = useState(false);

  const toggleCountry = () => {
    if (countryFlag === '🇺🇸') {
      setCountryFlag('🇲🇽');
      setPhonePrefix('(+52)');
      setPhoneNumber('33 1234 5678');
    } else {
      setCountryFlag('🇺🇸');
      setPhonePrefix('(+1)');
      setPhoneNumber('999 999 999');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || 'Usuario';
    const lastName = parts.slice(1).join(' ') || '';

    setTimeout(() => {
      if (updateUserProfile) {
        updateUserProfile({
          firstName,
          lastName,
          name: fullName,
          email,
          phone: `${phonePrefix} ${phoneNumber}`,
          address,
          zipCode,
          stateName,
        });
      }

      setIsSaving(false);
      addToast({
        title: 'Perfil Guardado',
        message: 'Tus datos de cuenta y titular han sido actualizados con éxito.',
        variant: 'success',
        duration: 4000,
      });

      onBack?.();
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-24 transition-colors">
      <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
        {/* Foto de Perfil Squircle con Icono de Cámara central */}
        <InsigniaAvatarPerfil onOpenSelector={onOpenAvatarSelector} />

        {/* Campo 1: Full Name */}
        <CampoEntradaFlotante
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Hannah Turin"
          required
        />

        {/* Campo 2: Email Address */}
        <CampoEntradaFlotante
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hannah.turin@email.com"
          required
        />

        {/* Campo 3: Phone Number con bandera interactiva y check de verificación */}
        <CampoVerificacionTelefono
          countryFlag={countryFlag}
          phonePrefix={phonePrefix}
          phoneNumber={phoneNumber}
          onToggleCountry={toggleCountry}
          onChangeNumber={(e) => setPhoneNumber(e.target.value)}
        />

        {/* Campo 4: Current Address (Dirección del inmueble monitoreado) */}
        <CampoEntradaFlotante
          label="Current Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="907 Valley Drive, Allentown"
        />

        {/* Campos 5 & 6 en Fila: Zip Code & State */}
        <div className="grid grid-cols-2 gap-3.5">
          <CampoEntradaFlotante
            label="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="18109"
          />

          <div className="floating-input-box focus-within:!border-[#00C2FF] focus-within:!ring-2 focus-within:!ring-[#00C2FF]/15 flex items-center justify-between">
            <label className="floating-input-label">State</label>
            <select
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="Pennsylvania">Pennsylvania</option>
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="CDMX">Ciudad de México</option>
              <option value="Jalisco">Jalisco</option>
              <option value="Nuevo Leon">Nuevo León</option>
              <option value="Querétaro">Querétaro</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none shrink-0" />
          </div>
        </div>

        {/* Campo 7: Password (Enmascarado) */}
        <div className="floating-input-box">
          <label className="floating-input-label">Password</label>
          <input
            type="password"
            disabled
            value={password}
            className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none tracking-widest cursor-not-allowed select-none opacity-80"
          />
        </div>

        {/* Botón Secundario: Change Password */}
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101F30] hover:border-[#00C2FF] dark:hover:border-[#00C2FF] flex items-center justify-center gap-2 group transition-all cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <span className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#00C2FF] dark:group-hover:text-[#00C2FF] transition-colors">
            Change Password
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 group-hover:text-[#00C2FF] transition-all" />
        </button>

        {/* Botón Principal: Save Changes (Cyan Eléctrico Corporativo sustituyendo el naranja) */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-[#00C2FF] to-[#0284C7] hover:from-[#00B4D8] hover:to-[#0369A1] active:from-[#0284C7] active:to-[#075985] transition-all shadow-lg shadow-[#00C2FF]/25 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default PantallaEditarAvatar;
