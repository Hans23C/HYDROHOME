import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SplashScreen } from './views/SplashScreen';
import { LoginScreen } from './views/LoginScreen';
import { HomeDashboard } from './views/HomeDashboard';
import { MySystemsScreen } from './views/MySystemsScreen';
import { ReportsScreen } from './views/ReportsScreen';
import { ConsumptionChart } from './components/charts/ConsumptionChart';
import { Header } from './components/layout/Header';
import { NavigationBar } from './components/layout/NavigationBar';
import { GuiaRapidaDialogo } from './components/modals/GuiaRapidaDialogo';
import { NotificationsSheet } from './components/modals/NotificationsSheet';
import { LogoutDialog } from './components/modals/LogoutDialog';
import { AvatarSelectorModal } from './components/modals/AvatarSelectorModal';
import { NordDrawer } from './components/nord/NordDrawer';
import { NordToastGroup } from './components/nord/NordToastGroup';
import { FloatingAlertBanner } from './components/notifications/FloatingAlertBanner';
import { Monitor, Signal, Wifi, BarChart3, DollarSign } from 'lucide-react';

const TAB_INDEX_TO_ID = {
  0: 'home',
  1: 'consumption',
  2: 'systems',
  3: 'reports',
};

const TAB_ID_TO_INDEX = {
  home: 0,
  consumption: 1,
  systems: 2,
  reports: 3,
};

// Apartado exclusivo de Consumo: recuadro superior despegado de la barra y gráfica siempre centrada adaptable a cualquier pantalla
const ConsumptionView = () => {
  const { activeSystem } = useAuth();
  const sys = activeSystem || { name: 'Casa Principal', dailyConsumption: 248, capacity: 5000 };
  const estimatedCost = ((sys.dailyConsumption * 30) / 1000 * 18.5).toFixed(2);

  return (
    <div className="flex-1 flex flex-col justify-center gap-6 sm:gap-7 pb-20 w-full min-h-[calc(100dvh-170px)]">
      {/* Resumen Superior despegado con holgura de la barra superior */}
      <div className="mt-6 sm:mt-8 liquid-glass p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 max-w-3xl w-full mx-auto shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
              Consumo · {sys.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Historial diario en litros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          <DollarSign className="w-4 h-4" />
          <span>Est. Mensual: ${estimatedCost} MXN</span>
        </div>
      </div>

      {/* Gráfica Oficial de Consumo siempre centrada */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto my-auto">
        <ConsumptionChart />
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, logout, viewMode, toggleViewMode, isDark } = useAuth();
  const [currentView, setCurrentView] = useState('splash');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  const handleSplashFinish = useCallback((target) => {
    if (target === 'login') {
      setCurrentView('login');
    } else {
      setCurrentView(0);
    }
  }, []);

  if (currentView === 'splash') {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" onFinish={handleSplashFinish} />
      </AnimatePresence>
    );
  }

  if (currentView === 'login' || !user) {
    return (
      <AnimatePresence mode="wait">
        <LoginScreen
          key="login"
          onLoginSuccess={(initialTab) => {
            setCurrentView(initialTab || 0);
          }}
        />
      </AnimatePresence>
    );
  }

  const numericTab = typeof currentView === 'number' ? currentView : (TAB_ID_TO_INDEX[currentView] ?? 0);
  const stringTabId = TAB_INDEX_TO_ID[numericTab] || 'home';

  const handleSelectTab = (tab) => {
    if (typeof tab === 'number') {
      setCurrentView(tab);
    } else if (typeof tab === 'string' && TAB_ID_TO_INDEX[tab] !== undefined) {
      setCurrentView(TAB_ID_TO_INDEX[tab]);
    }
  };

  const renderActiveView = () => {
    switch (numericTab) {
      case 0:
        return (
          <HomeDashboard
            onNavigateToSystems={() => handleSelectTab(2)}
            onNavigateToReports={() => handleSelectTab(3)}
          />
        );
      case 1:
        return <ConsumptionView />;
      case 2:
        return <MySystemsScreen onSelectSystemAndGoHome={() => handleSelectTab(0)} />;
      case 3:
        return <ReportsScreen />;
      default:
        return (
          <HomeDashboard
            onNavigateToSystems={() => handleSelectTab(2)}
            onNavigateToReports={() => handleSelectTab(3)}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-dvh flex flex-col font-sans transition-colors duration-300 selection:bg-cyan-500 selection:text-white relative ${
        isDark ? 'bg-[#07131F] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Toasts automáticos de 5 segundos */}
      <NordToastGroup position="top-right" />

      {/* Selector de Avatar */}
      <AvatarSelectorModal
        isOpen={isAvatarSelectorOpen}
        onClose={() => setIsAvatarSelectorOpen(false)}
      />

      {/* Drawer Lateral del Avatar */}
      <NordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenLogout={() => {
          setIsDrawerOpen(false);
          setIsLogoutOpen(true);
        }}
        onOpenAvatarSelector={() => {
          setIsDrawerOpen(false);
          setIsAvatarSelectorOpen(true);
        }}
      />

      {/* Diálogos Globales */}
      <GuiaRapidaDialogo isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <NotificationsSheet isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
          setCurrentView('login');
        }}
      />

      {/* ============================================================== */}
      {/* 📱 MODO SIMULADOR MÓVIL (Adaptado a lo largo de cada pantalla)  */}
      {/* ============================================================== */}
      {viewMode === 'mobile-frame' ? (
        <div className="min-h-dvh w-full bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-center sm:py-4 px-0 sm:px-4 transition-colors">
          <div className="w-full max-w-[440px] hidden sm:flex items-center justify-between mb-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-xs shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Hydro Home Móvil
              </span>
            </div>
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 hover:bg-cyan-100 dark:hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-500/30 transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Modo Escritorio</span>
            </button>
          </div>

          <div className="w-full max-w-[440px] h-dvh sm:h-[min(860px,90dvh)] bg-slate-50 dark:bg-[#07131F] sm:rounded-[44px] sm:border-[8px] sm:border-slate-300 dark:sm:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative sm:ring-1 sm:ring-slate-400/40 dark:sm:ring-slate-700/50">
            {/* Barra de Estado Telefónica */}
            <div className="w-full h-9 px-6 pt-1.5 flex items-center justify-between bg-white/95 dark:bg-[#07131F]/95 text-slate-800 dark:text-slate-200 select-none z-30 shrink-0 border-b border-slate-100 dark:border-slate-800/40">
              <span className="font-bold text-xs tracking-tight">9:41</span>

              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-900/80" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[10px]">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <div className="w-4 h-2 rounded-xs border border-current p-0.5 flex items-center">
                  <div className="h-full w-2 bg-current rounded-xs" />
                </div>
              </div>
            </div>

            {/* Cabecera Minimalista (Logo, Notificaciones y Avatar) */}
            <Header
              activeTab={stringTabId}
              setActiveTab={handleSelectTab}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenDrawer={() => setIsDrawerOpen(true)}
            />

            <main className="flex-1 w-full overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              <FloatingAlertBanner onOpenNotifications={() => setIsNotificationsOpen(true)} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={numericTab}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {renderActiveView()}
                </motion.div>
              </AnimatePresence>
            </main>

            <NavigationBar
              activeTab={numericTab}
              onSelectTab={handleSelectTab}
              isInsideFrame={true}
            />
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 💻 MODO ESCRITORIO / WEB COMPLETO (Adaptado a lo largo dvh)     */
        /* ============================================================== */
        <div className="flex-1 flex flex-col min-h-dvh justify-between">
          <Header
            activeTab={stringTabId}
            setActiveTab={handleSelectTab}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-8 pb-28">
            <FloatingAlertBanner onOpenNotifications={() => setIsNotificationsOpen(true)} />

            <AnimatePresence mode="wait">
              <motion.div
                key={numericTab}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </main>

          <NavigationBar
            activeTab={numericTab}
            onSelectTab={handleSelectTab}
            isInsideFrame={false}
          />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
