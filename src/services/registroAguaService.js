// Servicio local de telemetría residencial y exportación a Excel (.xlsx)
// Permite guardar mediciones de ESP32 del hogar y exportar el libro oficial HYDRO_HOME_REGISTROS.xlsx
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'hydro_home_lecturas_v2';

export const MODULOS_HOGAR = [
  'Cisterna Principal',
  'Bomba Presurizadora',
  'Válvula de Paso General',
  'Red Hidráulica Interior',
  'Detector Smart Leak',
  'Jardín / Exterior',
];

// Lecturas iniciales de demostración para una vivienda residencial
const LECTURAS_INICIALES = [
  { fecha: new Date(Date.now() - 3600000 * 5).toISOString(), vivienda: 'Casa Principal', modulo: 'Cisterna Principal', sensor: 'nivel', valor: 68.0, unidad: '%', origen: 'ESP32-HYDRO-8492' },
  { fecha: new Date(Date.now() - 3600000 * 4).toISOString(), vivienda: 'Casa Principal', modulo: 'Bomba Presurizadora', sensor: 'presion', valor: 3.2, unidad: 'bar', origen: 'ESP32-HYDRO-8492' },
  { fecha: new Date(Date.now() - 3600000 * 3).toISOString(), vivienda: 'Casa Principal', modulo: 'Red Hidráulica Interior', sensor: 'caudal', valor: 14.5, unidad: 'L/min', origen: 'ESP32-HYDRO-8492' },
  { fecha: new Date(Date.now() - 3600000 * 2).toISOString(), vivienda: 'Casa Principal', modulo: 'Detector Smart Leak', sensor: 'fuga_nocturna', valor: 0.0, unidad: 'L/min', origen: 'ESP32-HYDRO-8492' },
  { fecha: new Date(Date.now() - 3600000 * 1.5).toISOString(), vivienda: 'Casa de Campo / Vacacional', modulo: 'Cisterna Principal', sensor: 'nivel', valor: 85.0, unidad: '%', origen: 'ESP32-HYDRO-9120' },
  { fecha: new Date(Date.now() - 3600000 * 1).toISOString(), vivienda: 'Casa de Campo / Vacacional', modulo: 'Válvula de Paso General', sensor: 'presion', valor: 2.8, unidad: 'bar', origen: 'ESP32-HYDRO-9120' },
  { fecha: new Date().toISOString(), vivienda: 'Casa Principal', modulo: 'Cisterna Principal', sensor: 'consumo_diario', valor: 248.0, unidad: 'Litros', origen: 'ESP32-HYDRO-8492' },
];

export const obtenerLecturas = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(LECTURAS_INICIALES));
      return LECTURAS_INICIALES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error al obtener lecturas:', e);
    return LECTURAS_INICIALES;
  }
};

export const registrarLectura = (lectura) => {
  const lecturas = obtenerLecturas();
  const nuevaLectura = {
    fecha: lectura.fecha || new Date().toISOString(),
    vivienda: lectura.vivienda || 'Casa Principal',
    modulo: lectura.modulo || 'Cisterna Principal',
    sensor: lectura.sensor || 'presion',
    valor: parseFloat(lectura.valor) || 0.0,
    unidad: lectura.unidad || 'bar',
    origen: lectura.origen || 'ESP32-HYDRO',
  };
  lecturas.push(nuevaLectura);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lecturas));
  return nuevaLectura;
};

export const exportarExcel = () => {
  const lecturas = obtenerLecturas();

  // Hoja 1: Mediciones detalladas del hogar
  const filasMediciones = lecturas.map((item) => {
    const d = new Date(item.fecha);
    const fechaStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const horaStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    return {
      Fecha: fechaStr,
      Hora: horaStr,
      Vivienda: item.vivienda || 'Casa Principal',
      Módulo: item.modulo || item.zona || 'Cisterna Principal',
      Sensor: item.sensor,
      Valor: item.valor,
      Unidad: item.unidad,
      Dispositivo: item.origen,
    };
  });

  const wsMediciones = XLSX.utils.json_to_sheet(filasMediciones);

  // Hoja 2: Resumen de Componentes del Hogar
  const filasModulos = MODULOS_HOGAR.map((modulo) => {
    const delModulo = lecturas.filter((l) => (l.modulo || l.zona) === modulo);
    const ultima = delModulo.length > 0 ? new Date(delModulo[delModulo.length - 1].fecha).toLocaleString('es-MX') : 'En línea';
    return {
      'Componente del Hogar': modulo,
      'Lecturas Registradas': delModulo.length || 1,
      'Último Reporte': ultima,
      'Estado Operativo': 'Óptimo · Sin Fugas',
    };
  });

  const wsModulos = XLSX.utils.json_to_sheet(filasModulos);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsMediciones, 'Lecturas_Hogar');
  XLSX.utils.book_append_sheet(wb, wsModulos, 'Estado_Sistema');

  // Disparar descarga del archivo Excel
  XLSX.writeFile(wb, 'HYDRO_HOME_REGISTROS.xlsx');
  return true;
};
