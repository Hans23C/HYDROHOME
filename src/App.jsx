import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PantallaCarga } from './views/PantallaCarga';
import { PantallaIniciarSesion } from './views/PantallaIniciarSesion';
import { PanelInicio } from './views/PanelInicio';
import { PantallaConsumo } from './views/PantallaConsumo';
import { PantallaMisSistemas } from './views/PantallaMisSistemas';
import { PantallaReportes } from './views/PantallaReportes';
import { PantallaPerfil } from './views/PantallaPerfil';
import { ChatAyudaInteligente } from './views/ChatAyudaInteligente';
import { PantallaContactarServicios } from './views/PantallaContactarServicios';
import { PantallaEditarAvatar } from './views/PantallaEditarAvatar';
import { PantallaAgregarSistemaOContrasena } from './views/PantallaAgregarSistemaOContrasena';
import { PantallaNuevoSistemaFlujo } from './views/PantallaNuevoSistemaFlujo';
import { PantallaNotificaciones } from './views/PantallaNotificaciones';
import { Encabezado } from './components/layout/Encabezado';
import { BarraNavegacion } from './components/layout/BarraNavegacion';
import { ModalSelectorAvatar } from './components/modals/ModalSelectorAvatar';
import { DialogoCerrarSesion } from './components/modals/DialogoCerrarSesion';
import { NordToastGroup } from './components/nord/NordToastGroup';
import { Monitor } from 'lucide-react';
import { BotonFlotanteSoporteIA } from './components/common/BotonFlotanteSoporteIA';

const AppContent = () => {
  const { user, logout, viewMode, toggleViewMode } = useAuth();

  // Persistencia de etapa de la app: si existe sesión en localStorage, entra directo a 'tabs'
  const [appStage, setAppStage] = useState(() => {
    try {
      const hasToken = Boolean(localStorage.getItem('session_token'));
      const hasUser = Boolean(
        localStorage.getItem('user_email') || localStorage.getItem('hydro_session_user')
      );
      if (hasToken && hasUser) {
        return 'tabs';
      }
    } catch (_) {}
    return 'splash';
  });

  // Pestaña activa principal persistente (0: Inicio, 1: Consumo, 2: Sistemas, 3: Perfil)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem('hydro_active_tab');
      return savedTab !== null ? Number(savedTab) : 0;
    } catch (_) {
      return 0;
    }
  });

  // Sub-vista activa: null | 'notifications' | 'chat' | 'contact' | 'edit-avatar' | 'add-system' | 'change-password' | 'faq'
  const [subView, setSubView] = useState(null);

  // Modales globales
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Mantener sincronizado el estado de navegación y sesión con localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hydro_app_stage', 'tabs');
      localStorage.setItem('hydro_active_tab', String(activeTab));
      if (appStage === 'login') {
        setAppStage('tabs');
      }
    }
  }, [user, activeTab, appStage]);

  const handleSplashFinish = useCallback((target) => {
    if (target === 'login' && !localStorage.getItem('session_token')) {
      setAppStage('login');
    } else {
      setAppStage('tabs');
    }
  }, []);

  if (appStage === 'splash') {
    return (
      <AnimatePresence mode="wait">
        <PantallaCarga key="splash" onFinish={handleSplashFinish} />
      </AnimatePresence>
    );
  }

  if (appStage === 'login' || !user) {
    return (
      <AnimatePresence mode="wait">
        <PantallaIniciarSesion
          key="login"
          onLoginSuccess={() => {
            setAppStage('tabs');
            setActiveTab(0);
            setSubView(null);
          }}
        />
      </AnimatePresence>
    );
  }

  // Navegación de pestañas
  const handleSelectTab = (tabIndex) => {
    setActiveTab(tabIndex);
    setSubView(null);
  };

  // Volver atrás desde una sub-vista
  const handleBack = () => {
    setSubView(null);
  };

  // Títulos dinámicos de cabecera 100% en español
  const getHeaderTitle = () => {
    if (subView === 'notifications') return 'Notificaciones';
    if (subView === 'chat') return 'Soporte Inteligente';
    if (subView === 'contact') return 'Servicios de Agua Potable';
    if (subView === 'edit-avatar') return 'Editar Perfil';
    if (subView === 'change-password') return 'Cambiar Contraseña';
    if (subView === 'add-system') return 'Agregar Nuevo Sistema';
    if (subView === 'faq') return 'Preguntas Frecuentes';

    switch (activeTab) {
      case 0:
        return null; // Muestra el logo de Hydro Home
      case 1:
        return 'Historial de Consumo';
      case 2:
        return 'Mis Sistemas';
      case 3:
        return 'Mi Perfil';
      default:
        return null;
    }
  };

  const renderCurrentContent = () => {
    // Si hay una sub-vista activa, se renderiza con prioridad
    if (subView) {
      switch (subView) {
        case 'notifications':
          return (
            <PantallaNotificaciones
              onBack={handleBack}
              onNavigateToChat={() => setSubView('chat')}
            />
          );
        case 'chat':
          return (
            <ChatAyudaInteligente
              onBack={handleBack}
              onNavigateHome={() => {
                setSubView(null);
                setActiveTab(0);
              }}
            />
          );
        case 'contact':
          return (
            <PantallaContactarServicios
              onNavigateToChat={() => setSubView('chat')}
              onNavigateToFaq={() => setSubView('faq')}
              onNavigateHome={() => {
                setSubView(null);
                setActiveTab(0);
              }}
            />
          );
        case 'edit-avatar':
          return (
            <PantallaEditarAvatar
              onBack={handleBack}
              onChangePassword={() => setSubView('change-password')}
              onOpenAvatarSelector={() => setIsAvatarSelectorOpen(true)}
            />
          );
        case 'change-password':
          return (
            <PantallaAgregarSistemaOContrasena
              initialMode="password"
              onBack={handleBack}
              onFinish={handleBack}
            />
          );
        case 'add-system':
          return (
            <PantallaNuevoSistemaFlujo
              onFinish={() => {
                setSubView(null);
                setActiveTab(2);
              }}
            />
          );
        case 'faq':
          return (
            <PantallaReportes
              onNavigateHome={() => {
                setSubView(null);
                setActiveTab(0);
              }}
            />
          );
        default:
          break;
      }
    }

    // Si no hay sub-vista, se renderiza la pestaña principal
    switch (activeTab) {
      case 0:
        return (
          <PanelInicio
            onNavigateToSystems={() => setActiveTab(2)}
            onNavigateToReports={() => setSubView('faq')}
            onNavigateToChat={() => setSubView('chat')}
            onNavigateToServices={() => setSubView('contact')}
          />
        );
      case 1:
        return <PantallaConsumo />;
      case 2:
        return (
          <PantallaMisSistemas
            onSelectSystemAndGoHome={() => setActiveTab(0)}
            onNavigateToAddSystem={() => setSubView('add-system')}
            onNavigateToServices={() => setSubView('contact')}
          />
        );
      case 3:
        return (
          <PantallaPerfil
            onNavigateToEditAvatar={() => setSubView('edit-avatar')}
            onNavigateToSystems={() => setActiveTab(2)}
            onNavigateToContactUs={() => setSubView('contact')}
            onOpenAvatarSelector={() => setIsAvatarSelectorOpen(true)}
            onOpenLogout={() => setIsLogoutOpen(true)}
          />
        );
      default:
        return (
          <PanelInicio
            onNavigateToSystems={() => setActiveTab(2)}
            onNavigateToReports={() => setSubView('faq')}
            onNavigateToChat={() => setSubView('chat')}
            onNavigateToServices={() => setSubView('contact')}
          />
        );
    }
  };

  const isSubViewActive = subView !== null;

  return (
    <div className="h-dvh w-full overflow-hidden flex flex-col font-sans bg-[#141618] text-slate-800 dark:text-slate-100 relative selection:bg-[#FF5B22] selection:text-white">
      {/* Sistema de Toasts */}
      <NordToastGroup position="top-right" />

      {/* Selector de Avatar DiceBear */}
      <ModalSelectorAvatar
        isOpen={isAvatarSelectorOpen}
        onClose={() => setIsAvatarSelectorOpen(false)}
      />

      {/* Diálogo de Confirmación de Cierre de Sesión */}
      <DialogoCerrarSesion
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
          setAppStage('login');
        }}
      />

      {/* ============================================================== */}
      {/* 📱 CONTENEDOR TIPO APLICACIÓN MÓVIL CENTRADO (Móvil / Web)      */}
      {/* ============================================================== */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 overflow-hidden">
        {/* Barra superior de herramientas en desktop */}
        <div className="w-full max-w-[480px] hidden sm:flex items-center justify-between mb-3 px-4 py-2 rounded-2xl bg-[#1E2022] border border-slate-800 text-xs shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B22] animate-pulse" />
            <span className="font-extrabold text-white">
              Shifty Hydro 2.0
            </span>
          </div>

          <button
            onClick={toggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{viewMode === 'mobile-frame' ? 'Pantalla Completa' : 'Modo Simulador'}</span>
          </button>
        </div>

        {/* Marco Principal del Dispositivo (App Shell h-dvh con scroll exclusivo en <main>) */}
        <div className="w-full sm:max-w-[480px] mx-auto relative flex-1 min-h-0 sm:flex-none sm:h-[min(880px,92dvh)] overflow-hidden flex flex-col bg-white dark:bg-[#0B1726] sm:rounded-[44px] sm:border-[8px] sm:border-[#2A2E33] shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          {/* Cabecera Estilizada Fija en la Cima */}
          <Encabezado
            title={getHeaderTitle()}
            showBack={isSubViewActive}
            onBack={handleBack}
            onOpenNotifications={() => setSubView('notifications')}
            onOpenProfile={() => {
              setSubView(null);
              setActiveTab(3);
            }}
          />

          {/* Único Contenedor con Scroll Vertical (o contenedor fijo para Chat) */}
          <main
            className={`flex-1 min-h-0 w-full overflow-x-hidden bg-white dark:bg-[#0B1726] rounded-t-[28px] -mt-6 relative z-20 no-scrollbar ${
              subView === 'chat' ? 'overflow-hidden flex flex-col pb-0' : 'overflow-y-auto pb-24'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={subView || activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={
                  subView === 'chat'
                    ? 'flex-1 min-h-0 h-full w-full min-w-0 flex flex-col'
                    : 'min-h-full w-full min-w-0 flex flex-col'
                }
              >
                {renderCurrentContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Botón Flotante (FAB) Rive de Soporte IA en Inicio */}
          {activeTab === 0 && !isSubViewActive && (
            <BotonFlotanteSoporteIA onClick={() => setSubView('chat')} />
          )}

          {/* Barra de Navegación con Notch Elevado */}
          <BarraNavegacion
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isInsideFrame={true}
          />
        </div>
      </div>
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
