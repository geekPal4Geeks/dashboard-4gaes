# Integración con Notion - 4Geeks Academy

Este proyecto incluye componentes avanzados para renderizar contenido de Notion usando `react-notion-x` con una experiencia de usuario mejorada.

## 🎯 Características Principales

- **Navegación jerárquica** por categorías (Proyectos, Mentorías, etc.)
- **Breadcrumbs** para mejor orientación
- **Indicadores visuales** para páginas con subguías
- **Diseño responsivo** con Material-UI
- **Estados de carga** y manejo de errores
- **Detección automática** de subpáginas en contenido

## 🧩 Componentes Disponibles

### 1. EnhancedNotionViewer
Componente principal con navegación jerárquica y breadcrumbs.

```jsx
import EnhancedNotionViewer from '../components/EnhancedNotionViewer';

const menuItems = [
  {
    id: "notion-page-id",
    title: "Título de la página",
    description: "Descripción",
    category: "Mentorías", // o "Proyectos"
  }
];

<EnhancedNotionViewer
  menuItems={menuItems}
  token={userToken}
  title="Mi Documentación"
/>
```

### 2. HierarchicalNotionMenu
Menú lateral con categorías expandibles y chips informativos.

```jsx
import HierarchicalNotionMenu from '../components/HierarchicalNotionMenu';

<HierarchicalNotionMenu
  menuItems={menuItems}
  onSelectPage={handlePageSelect}
  selectedPageId={currentPageId}
/>
```

### 3. NotionRenderer
Renderizador base de páginas de Notion (sin cambios).

## 🔧 Hooks Personalizados

### useNotionPage
Hook principal para cargar páginas:

```javascript
import { useNotionPage } from '../hooks/useNotionPage';
const { recordMap, loading, error } = useNotionPage(pageId, token);
```

## 📊 Estructura de Datos Mejorada

### Formato de menuItems

```javascript
{
  id: "string",           // ID de la página de Notion (32 caracteres)
  title: "string",        // Título a mostrar
  description: "string",  // Descripción breve
  category: "string",     // "Proyectos" | "Mentorías" | "General"
}
```

### Categorías Predefinidas

- **📚 Proyectos**: Color primario, icono School
- **👨‍🏫 Mentorías**: Color secundario, icono SupervisorAccount  
- **📄 General**: Color por defecto, icono Article

## 🎨 Características UX/UI

### ✅ Navegación Intuitiva
- Menú lateral con categorías expandibles
- Breadcrumbs para orientación
- Indicadores visuales claros

### ✅ Estados Informativos
- Pantalla de bienvenida atractiva
- Indicadores de carga elegantes
- Mensajes de error descriptivos

### ✅ Diseño Responsivo
- Layout adaptativo para móvil/desktop
- Componentes Material-UI optimizados
- Tipografía y espaciado consistentes

### ✅ Accesibilidad
- Navegación por teclado
- Etiquetas ARIA apropiadas
- Contraste de colores accesible

## 🔗 Páginas Reales Configuradas

El proyecto incluye las siguientes páginas de 4Geeks Academy:

1. **Requisitos del Proyecto Final** ([Ver página](https://4geeksacademy.notion.site/Requisitos-individuales-del-proyecto-final-Full-Stack-1b6c9f261fc680d7bd46d2f2b9cda4e3))
2. **Guía para Mentorías España** ([Ver página](https://4geeksacademy.notion.site/Gu-a-para-dar-mentor-as-Espa-a-4a49d7747d9447eb9181635a6284f7c9))
3. **Setup Calendly para Mentores** ([Ver página](https://4geeksacademy.notion.site/How-to-Setup-Calendly-for-becoming-a-mentor-cfa08abda9b64452a5e06cf363d8b33e))
4. **Responsabilidades de los Mentores** ([Ver página](https://www.notion.so/4geeksacademy/Responsabilidades-de-los-Mentores-c9e6a7bbd0324cd7a7a29603e635ecfb)) ⭐ *Contiene subguías*

## 🚀 Implementación

### Instalación
```bash
npm install react-notion-x
```

### Uso en tu aplicación
```jsx
import { useContext } from 'react';
import EnhancedNotionViewer from '../components/EnhancedNotionViewer';
import { AppContext } from '../store';

export default function MyDocumentation() {
  const { store } = useContext(AppContext);
  
  return (
    <EnhancedNotionViewer
      menuItems={MENU_ITEMS}
      token={store.token}
      title="Documentación 4Geeks Academy"
    />
  );
}
```

### Ruta de acceso
La documentación está disponible en: `/documentation`

## 💡 Recomendaciones UX/UI

### Para expandir funcionalidad:
1. **Búsqueda en contenido** con filtros por categoría
2. **Favoritos** para acceso rápido a páginas frecuentes
3. **Historial de navegación** para retroceder fácilmente
4. **Modo offline** con caché de páginas visitadas

## 🔧 API Backend Requerida

**Endpoint:** `POST /api/notion-page`
```json
// Request
{
  "pageId": "c9e6a7bbd0324cd7a7a29603e635ecfb"
}

// Response  
{
  "recordMap": { /* Objeto recordMap de Notion */ }
}
```

**Headers requeridos:**
```
Authorization: Token your-auth-token
Content-Type: application/json
``` 