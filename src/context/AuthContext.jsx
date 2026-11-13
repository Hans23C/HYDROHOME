import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DICEBEAR_COLLECTIONS = {
  'pixelbot': {
    name: 'Pixel Bot (Animado)',
    url: 'https://api.dicebear.com/10.x/pixelbot/svg',
    description: 'Robots pixelados cibernéticos con animación flotante',
    seeds: ['PixelHero', 'CyberAqua', 'HydroDroid', 'ByteValve', 'RoboFlow', 'PixelTech'],
    isAnimated: true,
  },
  'initial-face': {
    name: 'Initial Face (Animado)',
    url: 'https://api.dicebear.com/10.x/initial-face/svg',
    description: 'Rostros geométricos expresivos y modernos en movimiento',
    seeds: ['FaceGlow', 'AquaFace', 'HydroEcho', 'SmartSense', 'SafeFace', 'PureWater'],
    isAnimated: true,
  },
  'voxel-bot': {
    name: 'Voxel Bot',
    url: 'https://api.dicebear.com/10.x/voxel-bot/svg',
    description: 'Robots en 3D volumétrico de alta tecnología',
    seeds: ['HydroHome', 'AquaBot', 'SmartHome', 'EcoWater', 'WaterSafe', 'HomeValve'],
  },
  'clay': {
    name: 'Clay 3D',
    url: 'https://api.dicebear.com/10.x/clay/svg',
    description: 'Personajes amigables moldeados en arcilla 3D',
    seeds: ['CarlosHome', 'AnaWater', 'HomeOwner', 'FamilyEco', 'LucasWater', 'ValleCasa'],
  },
  'gaze': {
    name: 'Gaze',
    url: 'https://api.dicebear.com/10.x/gaze/svg',
    description: 'Miradas abstractas y arte vectorial contemporáneo',
    seeds: ['OceanGaze', 'AquaEye', 'DeepWater', 'FlowVision', 'GazeMaster', 'TelemetryEye'],
  },
  'constellation': {
    name: 'Constellation',
    url: 'https://api.dicebear.com/10.x/constellation/svg',
    description: 'Constelaciones geométricas y mapas estelares',
    seeds: ['Aquarius', 'Hydra', 'Pegasus', 'Cygnus', 'Orion', 'Centaurus'],
  },
};

export const getDicebearAvatarUrl = (style = 'clay', seed = 'HydroHome') => {
  const collection = DICEBEAR_COLLECTIONS[style] || DICEBEAR_COLLECTIONS['clay'];
  return `${collection.url}?seed=${encodeURIComponent(seed || 'HydroHome')}&radius=50`;
};

// Sistemas de demostración iniciales para usuarios residenciales
export const INITIAL_DEMO_SYSTEMS = [
  {
    id: 'sys-01',
    name: 'Casa Principal',
    address: 'Av. Jacarandas #124, Jardines del Valle',
    capacity: 5000, // Litros
    level: 0.68, // 68%
    pumpActive: true,
    pumpMode: 'auto', // 'auto' | 'manual' | 'off'
    pressure: 3.2, // bar
    flowRate: 14.5, // L/min
    valveOpen: true, // Válvula general (Modo Vacaciones)
    dailyConsumption: 248, // Litros hoy
    leakDetected: false,
    deviceId: 'ESP32-HYDRO-8492',
    status: 'online',
    isPrimary: true,
  },
  {
    id: 'sys-02',
    name: 'Casa de Campo / Vacacional',
    address: 'Paseo del Lago #8, Valle de Bravo',
    capacity: 10000, // Litros
    level: 0.85, // 85%
    pumpActive: false,
    pumpMode: 'auto',
    pressure: 2.8,
    flowRate: 0.0,
    valveOpen: false, // Válvula cerrada (Modo Vacaciones activo)
    dailyConsumption: 42,
    leakDetected: false,
    deviceId: 'ESP32-HYDRO-9120',
    status: 'online',
    isPrimary: false,
  },
];

// Sistemas iniciales para la cuenta de Administrador
export const INITIAL_ADMIN_SYSTEMS = [
  {
    id: 'sys-admin-01',
    name: 'Residencia Central Admin',
    address: 'Blvd. Bosques de las Lomas #402, Torre A',
    capacity: 10000,
    level: 0.82,
    pumpActive: true,
    pumpMode: 'auto',
    pressure: 3.6,
    flowRate: 18.2,
    valveOpen: true,
    dailyConsumption: 310,
    leakDetected: false,
    deviceId: 'ESP32-MASTER-0001',
    status: 'online',
    isPrimary: true,
  },
  ...INITIAL_DEMO_SYSTEMS,
];

// Cuentas preconfiguradas: Cuenta de Prueba y Cuenta de Administrador
export const DEFAULT_PRECONFIGURED_ACCOUNTS = [
  {
    id: 'user-prueba-1',
    firstName: 'Familia',
    lastName: 'Vásquez (Cuenta de Prueba)',
    email: 'prueba@hydrohome.io',
    password: 'Prueba#2024',
    role: 'usuario_prueba',
    roleLabel: 'Titular Residencial · Cuenta de Prueba',
    avatarStyle: 'clay',
    avatarSeed: 'CarlosHome',
    systems: INITIAL_DEMO_SYSTEMS,
    activeSystemId: 'sys-01',
  },
  {
    id: 'user-admin-1',
    firstName: 'Admin',
    lastName: 'HydroHome',
    email: 'admin@hydrohome.io',
    password: 'Admin#2024',
    role: 'admin',
    roleLabel: 'Administrador del Sistema Hydro Home',
    avatarStyle: 'voxel-bot',
    avatarSeed: 'HydroHome',
    systems: INITIAL_ADMIN_SYSTEMS,
    activeSystemId: 'sys-admin-01',
  },
];

export const AuthProvider = ({ children }) => {
  // 1. Usuarios registrados en localStorage (garantizando siempre Cuenta de Prueba y Admin)
  const [registeredAccounts, setRegisteredAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('hydro_registered_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asegurar que las dos cuentas oficiales existan en la lista
          const merged = [...parsed];
          DEFAULT_PRECONFIGURED_ACCOUNTS.forEach((defAcc) => {
            const exists = merged.some(
              (a) => a.email.toLowerCase() === defAcc.email.toLowerCase()
            );
            if (!exists) {
              merged.push(defAcc);
            }
          });
          return merged;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PRECONFIGURED_ACCOUNTS;
  });

  // Guardar cuentas actualizadas en localStorage
  useEffect(() => {
    localStorage.setItem('hydro_registered_accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // 2. Sesión del usuario actual (Persistente en localStorage)
  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem('session_token');
      const userEmail = localStorage.getItem('user_email');
      const cachedSessionUser = localStorage.getItem('hydro_session_user');

      if (!storedToken) return null;

      if (cachedSessionUser) {
        const parsed = JSON.parse(cachedSessionUser);
        if (parsed && parsed.email) {
          return { ...parsed, token: storedToken };
        }
      }

      if (!userEmail) return null;

      const found = registeredAccounts.find(
        (a) => a.email.toLowerCase() === userEmail.toLowerCase()
      );
      if (found) {
        return {
          token: storedToken,
          id: found.id,
          name: `${found.firstName} ${found.lastName}`.trim(),
          firstName: found.firstName,
          lastName: found.lastName,
          email: found.email,
          role: found.role || 'titular',
          roleLabel: found.roleLabel || 'Titular de Cuenta Residencial',
          avatarStyle: found.avatarStyle || 'clay',
          avatarSeed: found.avatarSeed || found.firstName,
          activeSystemId: found.activeSystemId || found.systems?.[0]?.id || 'sys-01',
        };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // 3. Sistemas vinculados a la cuenta actual
  const [userSystems, setUserSystems] = useState(() => {
    if (!user) return INITIAL_DEMO_SYSTEMS;
    const currentAccount = registeredAccounts.find(
      (a) => a.email.toLowerCase() === user.email.toLowerCase()
    );
    return currentAccount?.systems?.length ? currentAccount.systems : INITIAL_DEMO_SYSTEMS;
  });

  // ID del sistema activo
  const [activeSystemId, setActiveSystemId] = useState(() => {
    return user?.activeSystemId || userSystems[0]?.id || 'sys-01';
  });

  const activeSystem = userSystems.find((s) => s.id === activeSystemId) || userSystems[0];

  // Sincronizar cambios de sistemas con la cuenta del usuario en `registeredAccounts`
  useEffect(() => {
    if (!user) return;
    setRegisteredAccounts((prev) =>
      prev.map((acc) => {
        if (acc.email.toLowerCase() === user.email.toLowerCase()) {
          return {
            ...acc,
            systems: userSystems,
            activeSystemId,
          };
        }
        return acc;
      })
    );
  }, [userSystems, activeSystemId, user]);

  // 4. Modo Oscuro / Claro
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('hydro_theme_mode') || 'dark';
  });

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hydro_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 5. Modo de visualización: 'desktop' o 'mobile-frame'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('hydro_view_mode') || 'desktop';
  });

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'desktop' ? 'mobile-frame' : 'desktop';
      localStorage.setItem('hydro_view_mode', next);
      return next;
    });
  };

  const [soundAlerts, setSoundAlerts] = useState(() => {
    return localStorage.getItem('hydro_sound_alerts') !== 'false';
  });

  const [syncInterval, setSyncInterval] = useState(() => {
    return localStorage.getItem('hydro_sync_interval') || '30 seg';
  });

  // 6. MOTOR DE NOTIFICACIONES RESIDENCIALES DE 12 SEGUNDOS
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('hydro_home_notifications');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'notif-1',
        title: 'Cisterna al 68% · Nivel Normal',
        message: 'Reserva suficiente para 36 horas continuas de uso doméstico.',
        category: 'nivel',
        type: 'info',
        time: 'Hace 5 min',
        unseen: true,
        systemName: 'Casa Principal',
      },
      {
        id: 'notif-2',
        title: 'Válvula de Entrada en Servicio',
        message: 'Flujo doméstico estable a 3.2 bar sin fluctuaciones de presión.',
        category: 'bomba',
        type: 'success',
        time: 'Hace 20 min',
        unseen: true,
        systemName: 'Casa Principal',
      },
      {
        id: 'notif-3',
        title: 'Cero Fugas Detectadas',
        message: 'El detector nocturno Smart Leak no registró goteos en grifos o sanitarios.',
        category: 'fuga',
        type: 'success',
        time: 'Hace 1 hora',
        unseen: true,
        systemName: 'Casa Principal',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('hydro_home_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Alerta destacada para el banner flotante de 12 segundos
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);

  // Sistema de Toasts estilo Nordhealth
  const [toasts, setToasts] = useState([]);

  // =========================================================================
  // FUNCIONES DE CONTROL DE USUARIO & AUTENTICACIÓN
  // =========================================================================

  // Crear Cuenta (Registro de nuevo usuario)
  const registerUser = ({ firstName, lastName, email, password, initialSystemName = 'Casa Principal' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const newSystemId = `sys-${Date.now()}`;
    const newSystem = {
      id: newSystemId,
      name: initialSystemName.trim() || 'Casa Principal',
      address: 'Dirección residencial registrada',
      capacity: 5000,
      level: 0.70,
      pumpActive: true,
      pumpMode: 'auto',
      pressure: 3.2,
      flowRate: 12.0,
      valveOpen: true,
      dailyConsumption: 180,
      leakDetected: false,
      deviceId: `ESP32-HYDRO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'online',
      isPrimary: true,
    };

    const newAccount = {
      id: `user-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      password,
      role: 'titular',
      roleLabel: 'Titular de Cuenta Residencial',
      avatarStyle: 'clay',
      avatarSeed: firstName.trim(),
      systems: [newSystem],
      activeSystemId: newSystemId,
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);

    const token = `token_${Date.now()}`;
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_email', cleanEmail);
    localStorage.setItem('user_name', `${newAccount.firstName} ${newAccount.lastName}`.trim());

    setUser({
      token,
      id: newAccount.id,
      name: `${newAccount.firstName} ${newAccount.lastName}`.trim(),
      firstName: newAccount.firstName,
      lastName: newAccount.lastName,
      email: cleanEmail,
      role: newAccount.role,
      roleLabel: newAccount.roleLabel,
      avatarStyle: newAccount.avatarStyle,
      avatarSeed: newAccount.avatarSeed,
      activeSystemId: newSystemId,
    });

    setUserSystems([newSystem]);
    setActiveSystemId(newSystemId);
    setShowNotificationBanner(true);

    addToast({
      title: '¡Cuenta Creada Exitosamente!',
      message: `Bienvenido a Hydro Home, ${firstName}. Sistema "${newSystem.name}" enlazado.`,
      variant: 'success',
      duration: 5000,
    });
  };

  // Iniciar Sesión
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = registeredAccounts.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.password === password
    );

    if (!found) {
      throw new Error('Correo o contraseña incorrectos. Verifica tus datos o usa una cuenta de acceso rápido.');
    }

    const token = `token_${Date.now()}`;
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_email', cleanEmail);
    localStorage.setItem('user_name', `${found.firstName} ${found.lastName}`.trim());

    const sessionUserObj = {
      token,
      id: found.id,
      name: `${found.firstName} ${found.lastName}`.trim(),
      firstName: found.firstName,
      lastName: found.lastName,
      email: cleanEmail,
      role: found.role || 'titular',
      roleLabel: found.roleLabel || 'Titular de Cuenta Residencial',
      avatarStyle: found.avatarStyle || 'clay',
      avatarSeed: found.avatarSeed || found.firstName,
      activeSystemId: found.activeSystemId || found.systems?.[0]?.id || 'sys-01',
    };

    localStorage.setItem('hydro_session_user', JSON.stringify(sessionUserObj));
    localStorage.setItem('hydro_app_stage', 'tabs');
    setUser(sessionUserObj);

    setUserSystems(found.systems?.length ? found.systems : INITIAL_DEMO_SYSTEMS);
    setActiveSystemId(found.activeSystemId || found.systems?.[0]?.id || 'sys-01');

    // REGLA CLAVE: Si hay notificaciones que no fueron atendidas/vistas, se vuelven a mostrar por 12s
    const hasUnseenNotifs = notifications.some((n) => n.unseen);
    if (hasUnseenNotifs) {
      setShowNotificationBanner(true);
    }

    addToast({
      title: found.role === 'admin' ? 'Sesión de Administrador Activa' : 'Sesión Iniciada',
      message: `Hola de nuevo, ${found.firstName}. Monitoreando "${found.systems?.[0]?.name || 'Casa'}".`,
      variant: 'info',
      duration: 5000,
    });
  };

  // Cerrar Sesión (Único punto donde se limpia el almacenamiento local de sesión)
  const logout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('hydro_session_user');
    localStorage.removeItem('hydro_app_stage');
    localStorage.removeItem('hydro_active_tab');
    setUser(null);

    const hasUnseen = notifications.some((n) => n.unseen);
    if (hasUnseen) {
      setShowNotificationBanner(true);
    }
  };

  // =========================================================================
  // GESTIÓN MULTISISTEMA (Viviendas múltiples bajo la misma cuenta)
  // =========================================================================

  const switchSystem = (systemId) => {
    const target = userSystems.find((s) => s.id === systemId);
    if (target) {
      setActiveSystemId(systemId);
      addToast({
        title: 'Sistema Conectado',
        message: `Ahora estás monitoreando: ${target.name}`,
        variant: 'info',
        duration: 5000,
      });
    }
  };

  const linkNewSystem = ({ name, address, capacity = 5000, deviceId, silent = false }) => {
    const newSysId = `sys-${Date.now()}`;
    const newSystem = {
      id: newSysId,
      name: name.trim() || `Vivienda ${userSystems.length + 1}`,
      address: address?.trim() || 'Ubicación registrada',
      capacity: Number(capacity) || 5000,
      level: 0.75,
      pumpActive: true,
      pumpMode: 'auto',
      pressure: 3.1,
      flowRate: 0.0,
      valveOpen: true,
      dailyConsumption: 65,
      leakDetected: false,
      deviceId: deviceId?.trim() || `ESP32-HYDRO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'online',
      isPrimary: false,
    };

    setUserSystems((prev) => [...prev, newSystem]);
    setActiveSystemId(newSysId);

    addNotification({
      title: `Nuevo Sistema Enlazado: ${newSystem.name}`,
      message: `Kit ESP32 (${newSystem.deviceId}) sincronizado con éxito.`,
      category: 'nivel',
      type: 'success',
      systemName: newSystem.name,
    });

    if (!silent) {
      addToast({
        title: '¡Vivienda Enlazada con Éxito!',
        message: `El sistema "${newSystem.name}" ya está sincronizado y activo.`,
        variant: 'success',
        duration: 5000,
      });
    }
  };

  const unlinkSystem = (systemId) => {
    if (userSystems.length <= 1) {
      throw new Error('Debes mantener al menos un sistema de monitoreo enlazado a tu cuenta.');
    }
    const remaining = userSystems.filter((s) => s.id !== systemId);
    setUserSystems(remaining);
    setActiveSystemId(remaining[0].id);

    addToast({
      title: 'Sistema Desvinculado',
      message: 'La vivienda ha sido retirada de tu cuenta.',
      variant: 'warning',
      duration: 5000,
    });
  };

  const togglePump = (systemId, mode) => {
    setUserSystems((prev) =>
      prev.map((sys) => {
        if (sys.id === systemId) {
          const nextActive = mode === 'on' ? true : mode === 'off' ? false : !sys.pumpActive;
          return {
            ...sys,
            pumpActive: nextActive,
            pumpMode: mode || (nextActive ? 'auto' : 'off'),
          };
        }
        return sys;
      })
    );
  };

  const toggleGeneralValve = (systemId) => {
    setUserSystems((prev) =>
      prev.map((sys) => {
        if (sys.id === systemId) {
          const nextState = !sys.valveOpen;
          addToast({
            title: nextState ? 'Válvula General Abierta' : 'Modo Vacaciones Activado',
            message: nextState
              ? 'Suministro hídrico restaurado en la vivienda.'
              : 'Válvula general cerrada. Tu hogar está protegido contra fugas.',
            variant: nextState ? 'info' : 'warning',
            duration: 5000,
          });
          return {
            ...sys,
            valveOpen: nextState,
          };
        }
        return sys;
      })
    );
  };

  const updateSystemLevel = (systemId, newLevel) => {
    setUserSystems((prev) =>
      prev.map((sys) => {
        if (sys.id === systemId) {
          return { ...sys, level: Math.max(0.1, Math.min(1.0, newLevel)) };
        }
        return sys;
      })
    );
  };

  // =========================================================================
  // GESTIÓN DE NOTIFICACIONES Y TOASTS
  // =========================================================================

  const addNotification = ({ title, message, category = 'nivel', type = 'info', systemName }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      category,
      type,
      time: 'Ahora mismo',
      unseen: true,
      systemName: systemName || activeSystem?.name || 'Casa Principal',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setShowNotificationBanner(true);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationsAsSeen = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unseen: false })));
  };

  const dismissNotificationBanner = () => {
    setShowNotificationBanner(false);
  };

  const addToast = ({ title, message, variant = 'info', actionText, onAction, duration = 5000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { id, title, message, variant, actionText, onAction, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateAvatar = (style, seed) => {
    if (!user) return;
    setUser((prev) => ({ ...prev, avatarStyle: style, avatarSeed: seed }));
    setRegisteredAccounts((prev) =>
      prev.map((acc) => {
        if (acc.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...acc, avatarStyle: style, avatarSeed: seed };
        }
        return acc;
      })
    );
  };

  const updateUserProfile = (profileData) => {
    if (!user) return;
    const updated = { ...user, ...profileData };
    setUser(updated);
    setRegisteredAccounts((prev) =>
      prev.map((acc) => {
        if (acc.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...acc, ...profileData };
        }
        return acc;
      })
    );
    try {
      localStorage.setItem('hydro_session_user', JSON.stringify(updated));
    } catch (_) {}
  };

  const updateSoundAlerts = (enabled) => {
    setSoundAlerts(enabled);
    localStorage.setItem('hydro_sound_alerts', enabled.toString());
  };

  const updateSyncInterval = (interval) => {
    setSyncInterval(interval);
    localStorage.setItem('hydro_sync_interval', interval);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userSystems,
        activeSystem,
        activeSystemId,
        switchSystem,
        linkNewSystem,
        unlinkSystem,
        togglePump,
        toggleGeneralValve,
        updateSystemLevel,
        registerUser,
        login,
        logout,
        themeMode,
        isDark: themeMode === 'dark',
        toggleTheme,
        viewMode,
        toggleViewMode,
        soundAlerts,
        updateSoundAlerts,
        syncInterval,
        updateSyncInterval,
        notifications,
        addNotification,
        removeNotification,
        markNotificationsAsSeen,
        showNotificationBanner,
        dismissNotificationBanner,
        toasts,
        addToast,
        removeToast,
        updateToast: addToast,
        updateAvatar,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
