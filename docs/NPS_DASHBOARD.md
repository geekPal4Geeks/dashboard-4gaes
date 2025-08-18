# Dashboard NPS de Mentores

## Descripción

El Dashboard NPS de Mentores es una vista completa que permite a los mentores visualizar y analizar sus valoraciones NPS (Net Promoter Score) a lo largo del tiempo. Proporciona insights detallados sobre el rendimiento del mentor, la evolución de las cohortes y la participación de los estudiantes.

## Características Principales

### 📊 KPIs Principales

- **Promedio General del Profesor**: Puntuación promedio en todas las evaluaciones
- **Total de Evaluaciones**: Número total de evaluaciones recibidas
- **Total de Cohortes**: Desglose de cohortes activas vs finalizadas
- **Participación Promedio**: Porcentaje promedio de participación de estudiantes

### 📈 Gráficos de Progresión

- **Progresión del Profesor**: Gráfico de línea mostrando la evolución del mentor en cada cohorte
- **Progresión de la Cohorte**: Gráfico de línea para promedios de cohorte
- **Comparación Profesor vs Cohorte**: Gráfico de barras comparando rendimientos

### 📋 Tablas de Datos

- **Tabla de Cohortes**: Métricas detalladas por cohorte con filtros
- **Evaluaciones Recientes**: Últimas 10 evaluaciones con puntuaciones

### 🔧 Funcionalidades Adicionales

- **Filtros Avanzados**: Por cohorte específica y estado
- **Exportación de Datos**: Exportar a CSV/Excel
- **Modo Oscuro/Claro**: Cambio de tema
- **Diseño Responsive**: Adaptable a diferentes dispositivos
- **Tooltips Informativos**: Información contextual en gráficos

## Estructura de Datos

### Endpoint del Backend

```
POST /api/mentor-nps
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN"
}
Body: {
  "mentorId": "31a57e7b-db0f-421f-aea0-bf985e00de58"
}
```

### Estructura de Respuesta

```json
{
  "mentorId": "31a57e7b-db0f-421f-aea0-bf985e00de58",
  "mentorName": "Héctor Chocobar Torrejón",
  "overall": {
    "teacherAverage": 9.0,
    "totalEvaluations": 45
  },
  "totalCohorts": 10,
  "activeCohorts": 1,
  "pastCohorts": 9,
  "visualizationData": {
    "kpis": {
      "overallTeacherAverage": 9.0,
      "overallCohortAverage": 8.45,
      "totalEvaluations": 45,
      "totalCohorts": 10,
      "activeCohorts": 1,
      "finishedCohorts": 9,
      "averageParticipation": 79.2
    },
    "cohorts": [...],
    "charts": {...},
    "tables": {...}
  }
}
```

## Componentes

### 1. NpsKpiCards

Muestra las tarjetas de KPIs principales con iconos y colores según el rendimiento.

### 2. NpsProgressionCharts

Gráficos de línea usando Recharts para mostrar la progresión temporal.

### 3. NpsComparisonCharts

Gráficos de barras para comparar rendimientos entre profesor y cohorte.

### 4. NpsCohortsTable

Tabla interactiva con métricas detalladas por cohorte.

### 5. NpsRecentEvaluationsTable

Tabla de evaluaciones recientes con puntuaciones y estados.

## Escala de Puntuaciones

- **9-10**: Excelente (Verde)
- **7-8**: Bueno (Naranja)
- **0-6**: Mejorable (Rojo)

## Estados de Cohorte

- **Active**: Cohorte activa
- **Final Project**: Proyecto final
- **Finished**: Finalizada

## Tecnologías Utilizadas

- **React**: Framework principal
- **Material-UI**: Componentes de UI
- **Recharts**: Gráficos interactivos
- **Axios**: Cliente HTTP
- **React Router**: Navegación

## Instalación y Uso

1. **Instalar dependencias**:

   ```bash
   npm install recharts
   ```

2. **Configurar el backend**:

   - URL base: `http://localhost:5000`
   - Token de autorización requerido

3. **Acceder al dashboard**:
   - Navegar a `/mentor-nps`
   - Los datos se cargan automáticamente

## Datos de Prueba

Si el backend no está disponible, la aplicación utiliza datos de prueba incluidos en `src/services/mockNpsData.js`.

## Personalización

### Colores

Los colores se pueden personalizar en `src/services/mentorNpsService.js`:

- `getScoreColor()`: Colores según puntuación
- `getCohortStatusColor()`: Colores según estado de cohorte

### Gráficos

Los gráficos se pueden personalizar modificando los componentes en `src/components/nps/`.

## Mejoras Futuras

- [ ] Filtros por rango de fechas
- [ ] Gráficos de tendencias más avanzados
- [ ] Exportación a PDF
- [ ] Notificaciones de alertas
- [ ] Comparación entre mentores
- [ ] Métricas de NPS específicas

## Contribución

Para contribuir al desarrollo:

1. Seguir las convenciones de código existentes
2. Mantener la consistencia en el diseño
3. Agregar tests para nuevas funcionalidades
4. Documentar cambios importantes

## Soporte

Para soporte técnico o preguntas sobre el dashboard NPS, contactar al equipo de desarrollo.
