# HYDROINTELLIGENT — React Web App & PWA

Sistema Predictivo de Gestión Hídrica y Telemetría Universitaria (**AquaCampus Telemetry System · v2.0**).
Replicado y evolucionado a React con arquitectura moderna de componentes, Tailwind CSS v4, animaciones de fluidos a 60 FPS en HTML5 Canvas, analítica de agrupamiento K-Means (K=3) y exportación a Excel (.xlsx).

---

## 🚀 Cómo iniciar el proyecto

Para ejecutar el entorno de desarrollo local:

```bash
npm run dev
```

Para compilar para producción:

```bash
npm run build
```

Para previsualizar la compilación de producción:

```bash
npm run preview
```

---

## 👥 Perfiles y Credenciales de Demostración

La aplicación cuenta con botones de **Acceso Rápido en 1 Clic** en la pantalla de inicio de sesión:

| Rol | Correo | Contraseña | Funcionalidad Principal |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@aquacampus.edu.co` | `Admin#2024` | Gobernanza, semáforo de red, K-Means clustering, responder reportes y exportar registros a Excel. |
| **Personal de Mantenimiento** | `mantenimiento@aquacampus.edu.co` | `Mant#2024` | Telemetría de bombas en vivo, reporte de incidencias en el campus y gráficas de presión de turno. |

---

## 💧 Módulos y Funcionalidades Replicadas

1. **Splash Screen**:
   - Anillo hidro-luminoso con logo oficial.
   - Barra de carga suave y redirección automática según la sesión.
2. **Inicio de Sesión (Login)**:
   - Formulario de credenciales con validación y alternancia de visibilidad de contraseña.
   - Botones directos de 1 clic para Administrador y Mantenimiento con copiado rápido al portapapeles.
   - Frase institucional de concientización hídrica.
3. **Panel de Administración (Admin Dashboard)**:
   - Indicadores generales (KPIs) con comparativas de consumo, alertas y bombas activas.
   - **Simulación Hidráulica Interactiva**: Tanque cisterna con oleaje armónico 2.5D, burbujas procedimentales y controles interactivos (`+ Llenar`, `- Vaciar`, `68%`).
   - Tubería de distribución animada con interruptor de flujo y medición de caudal en vivo (L/min).
   - Gráfica de consumo diario interactiva (rangos de 7D, 14D y 21D) con detección de picos.
   - Estado en tiempo real de los 6 edificios del campus.
   - **Agrupamiento K-Means (K=3)**: Algoritmo de 20 iteraciones que clasifica las zonas en *Consumo Moderado*, *Consumo Regular* y *Demanda Alta*.
   - **Exportación oficial a Excel**: Genera y descarga el libro `HYDROINTELLIGENT_REGISTROS.xlsx` con hojas `Mediciones` y `Zonas`.
4. **Panel de Mantenimiento**:
   - Banner de alerta hero para atención prioritaria (Cafetería / BOM-003).
   - Lista interactiva de bombas con filtros (*Todas*, *Operativas*, *Advertencia*, *Críticas*), barra de rango de presión y modal de inspección técnica.
   - Gráfica de presión por zona con línea objetivo de **4.0 bar**.
   - Botón flotante para registrar nuevas incidencias en el campus.
5. **Zonas del Campus (Edificios)**:
   - Tarjetas dedicadas para **Edificio A, Edificio B, Edificio C, Edificio D, Edificio E y Cafetería Central**.
   - Tuberías individuales de flujo animado en miniatura.
   - Bombas asignadas con presión de descarga en tiempo real.
   - Modal de inspección profunda con botón de prueba de calibración de válvulas.
6. **Reportes Bidireccionales**:
   - Mantenimiento sube reportes (Edificio, Severidad, Título, Descripción).
   - Administrador revisa, asigna respuesta oficial autorizada y actualiza el estado (*Pendiente*, *En proceso*, *Resuelto*).
   - Persistencia local en navegador.
7. **Ajustes y Perfil Operativo**:
   - Selector de avatar técnico (6 distintivos visuales).
   - Alternador de Modo Claro / Modo Oscuro.
   - Selector de frecuencia de telemetría ESP32 (30s, 1m, 5m).
   - Interruptor de alarmas sonoras para presión crítica.
   - Cierre de sesión seguro con diálogo de confirmación glassmorphism.
8. **Barra Superior y Diálogos Globales**:
   - Centro de notificaciones con filtro por criticidad (*Todas*, *Críticas*, *Preventivas*).
   - **Guía Rápida del Sistema**: Explicación del semáforo de colores e indicadores para usuarios no técnicos.
