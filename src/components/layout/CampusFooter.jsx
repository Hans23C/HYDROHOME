import React from 'react';
import { Activity, ShieldCheck, Wifi } from 'lucide-react';

export const CampusFooter = ({ className = '' }) => {
  return (
    <footer className={`mt-8 pt-6 pb-4 border-t border-slate-200 dark:border-slate-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Estado del Enlace Hídrico */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wifi className="w-3 h-3" />
            <span>ESP32 Telemetría En Línea</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Activity className="w-3 h-3 text-sky-500" />
            <span>MQTT v2.4 · Latencia 18ms</span>
          </div>
        </div>

        {/* Marca de Versión */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>HYDRO INTELLIGENT HOME · Sistema Hídrico Residencial</span>
        </div>
      </div>
    </footer>
  );
};

export default CampusFooter;
