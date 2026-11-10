// Servicio de Bitácora Residencial & Asistencia Técnica Hogar
const STORAGE_KEY_REPORTS = 'hydro_home_services_v1';

const SERVICIOS_INICIALES = [
  {
    id: 'SRV-101',
    title: 'Limpieza y Desinfección Anual de Cisterna (5,000 L)',
    systemName: 'Casa Principal',
    category: 'Cisterna y Almacenamiento',
    description: 'Lavado a presión de muros de cisterna, vaciado de sedimentos y cloración preventiva según norma sanitaria.',
    severity: 'Programado',
    author: 'Jesús Vásquez Granda',
    date: '2026-11-08',
    time: '10:00 AM',
    createdAt: '08/11/2026, 10:00 AM',
    status: 'Concluido',
    technicianNotes: 'Cisterna desinfectada al 100%. Llenado completado. Se dejó válvula en servicio normal.',
    technicianName: 'Téc. Fernando Ruiz (AquaCare Domicilio)',
  },
  {
    id: 'SRV-102',
    title: 'Mantenimiento Preventivo de Bomba Presurizadora',
    systemName: 'Casa Principal',
    category: 'Bomba y Presión',
    description: 'Revisión de capacitor de arranque, engrase de baleros y calibración de presostato a 3.2 bar.',
    severity: 'Mantenimiento',
    author: 'Jesús Vásquez Granda',
    date: '2026-11-06',
    time: '03:30 PM',
    createdAt: '06/11/2026, 03:30 PM',
    status: 'Concluido',
    technicianNotes: 'Bomba operando silenciosamente. Presión estabilizada a 3.2 bar en regaderas y cocina.',
    technicianName: 'Téc. Fernando Ruiz (AquaCare Domicilio)',
  },
  {
    id: 'SRV-103',
    title: 'Reemplazo de Filtro de Sedimentos de Entrada Principal',
    systemName: 'Casa de Campo / Vacacional',
    category: 'Filtración y Calidad',
    description: 'Sustitución de cartucho polipropileno de 20 micras para retención de tierra y arena de la red pública.',
    severity: 'Preventivo',
    author: 'Jesús Vásquez Granda',
    date: '2026-11-02',
    time: '11:15 AM',
    createdAt: '02/11/2026, 11:15 AM',
    status: 'Concluido',
    technicianNotes: 'Filtro nuevo instalado con sello hermético. Manómetro marca 0.1 bar de caída nominal.',
    technicianName: 'Téc. Marco Valdés',
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
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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
    const fechaClave = reporte.date || (reporte.createdAt ? reporte.createdAt.substring(0, 10) : '2026-11-06');
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
    console.error('Error al leer bitácora residencial:', e);
  }
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(SERVICIOS_INICIALES));
  return SERVICIOS_INICIALES;
};

export const guardarReporte = (nuevo) => {
  const actual = obtenerReportes();
  const nextNum = actual.length + 101;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const item = {
    id: `SRV-${nextNum}`,
    title: nuevo.title,
    systemName: nuevo.systemName || 'Casa Principal',
    category: nuevo.category || 'Mantenimiento General',
    description: nuevo.description,
    severity: nuevo.severity || 'Solicitado',
    author: nuevo.author || 'Propietario',
    date: dateStr,
    time: timeStr,
    createdAt: `${now.toLocaleDateString()}, ${timeStr}`,
    status: 'Solicitado',
    technicianNotes: 'Solicitud agendada en sistema. Se asignará especialista técnico domiciliario.',
    technicianName: 'Por asignar',
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
  const dateStr = `${now.toLocaleDateString()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updated = {
    ...actual[index],
    status: newStatus || actual[index].status,
    technicianNotes: responseText,
    technicianName: techName || actual[index].technicianName,
    lastUpdate: dateStr,
  };

  actual[index] = updated;
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(actual));
  return updated;
};
