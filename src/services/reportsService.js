// Servicio de Bitácora Técnica de Incidencias y Averías en Tuberías
const STORAGE_KEY_REPORTS = 'hydro_pipe_incidents_v1';

const INCIDENCIAS_INICIALES = [
  {
    id: 'INC-101',
    title: 'Fisura en Codo de PVC Hidráulico (Línea Principal)',
    systemName: 'Casa Principal',
    category: 'Tubería Principal',
    description:
      'Caída súbita de presión detectada por el sensor ESP32 (de 3.2 bar a 1.4 bar). Se localizó filtración en unión de tubería de 1/2 pulgada en patio trasero.',
    severity: 'Alta',
    author: 'Jesús Vásquez Granda',
    date: '2026-11-14',
    time: '09:40 AM',
    createdAt: '14/11/2026, 09:40 AM',
    status: 'En Revisión',
    technicianName: 'Plomero Héctor Méndez',
    stateDetail: 'Reparación en curso',
  },
  {
    id: 'INC-102',
    title: 'Obstrucción por Sarro en Válvula Check de Bomba',
    systemName: 'Casa Principal',
    category: 'Válvulas y Bomba',
    description:
      'Flujo reducido a 2 L/min con bomba activa. Se realizó desarme, limpieza de sedimentos calcáreos y sustitución de empaque de retención.',
    severity: 'Media',
    author: 'Jesús Vásquez Granda',
    date: '2026-10-28',
    time: '04:15 PM',
    createdAt: '28/10/2026, 04:15 PM',
    status: 'Reparado',
    technicianName: 'Téc. Fernando Ruiz',
    stateDetail: 'Presión restablecida a 3.1 bar',
  },
  {
    id: 'INC-103',
    title: 'Desacople en Tubería de Alimentación a Tinaco',
    systemName: 'Casa Principal',
    category: 'Alimentación y Tinaco',
    description:
      'Sobrepresión por golpe de ariete provocó desprendimiento en conector roscado superior. Se reforzó con termofusión y válvula reguladora.',
    severity: 'Alta',
    author: 'Jesús Vásquez Granda',
    date: '2026-09-19',
    time: '11:20 AM',
    createdAt: '19/09/2026, 11:20 AM',
    status: 'Reparado',
    technicianName: 'Téc. Fernando Ruiz',
    stateDetail: 'Red sellada sin fugas',
  },
];

export const formatearCabeceraDia = (dateStr) => {
  if (!dateStr) {
    const today = new Date();
    dateStr = today.toISOString().split('T')[0];
  }
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m - 1, d);

  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return {
    diaSemana: dias[dateObj.getDay()],
    diaNumero: d,
    mesNombre: meses[m - 1],
    anio: y,
    formatoLargo: `${dias[dateObj.getDay()]}, ${d} de ${meses[m - 1]} de ${y}`,
  };
};

export const agruparReportesPorDia = (listaReportes) => {
  const grupos = {};

  (listaReportes || []).forEach((reporte) => {
    const fechaClave =
      reporte.date ||
      (reporte.createdAt ? reporte.createdAt.substring(0, 10) : '2026-11-14');
    if (!grupos[fechaClave]) {
      grupos[fechaClave] = [];
    }
    grupos[fechaClave].push(reporte);
  });

  return Object.keys(grupos)
    .sort((a, b) => b.localeCompare(a))
    .map((fecha) => ({
      fecha,
      cabecera: formatearCabeceraDia(fecha),
      reportes: grupos[fecha],
    }));
};

export const obtenerReportes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error al leer bitácora de incidencias:', e);
  }
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INCIDENCIAS_INICIALES));
  return INCIDENCIAS_INICIALES;
};

export const guardarReporte = (nuevo) => {
  const actual = obtenerReportes();
  const nextNum = actual.length + 101;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const item = {
    id: `INC-${nextNum}`,
    title: nuevo.title,
    systemName: nuevo.systemName || 'Casa Principal',
    category: nuevo.category || 'Tubería Principal',
    description: nuevo.description,
    severity: nuevo.severity || 'Alta',
    author: nuevo.author || 'Jesús Vásquez Granda',
    date: dateStr,
    time: timeStr,
    createdAt: `${now.toLocaleDateString()}, ${timeStr}`,
    status: 'En Revisión',
    technicianName: 'Por asignar',
    stateDetail: 'Inspección técnica programada',
  };

  const listaActualizada = [item, ...actual];
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(listaActualizada));
  return item;
};

export const responderReporte = (id, responseText, newStatus, techName) => {
  const actual = obtenerReportes();
  const index = actual.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const now = new Date();
  const dateStr = `${now.toLocaleDateString()}, ${now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const updated = {
    ...actual[index],
    status: newStatus || actual[index].status,
    stateDetail: responseText,
    technicianName: techName || actual[index].technicianName,
    lastUpdate: dateStr,
  };

  actual[index] = updated;
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(actual));
  return updated;
};
