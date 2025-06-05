import EnhancedNotionViewer from '../components/EnhancedNotionViewer';
import useGlobalReducer from '../hooks/useGlobalReducer';

// IDs extraídos de las URLs de Notion reales de 4Geeks Academy
const MENU_ITEMS = [
  // Inicio
  {
    id: "c9e6a7bbd0324cd7a7a29603e635ecfb",
    title: "Responsabilidades de los Mentores",
    description: "Guía completa sobre el rol y responsabilidades de los mentores",
    category: "Inicio"
  },
  // Mentorías (siempre visibles)
  {
    id: "1bcc9f261fc680c7bacadeddd35b6807",
    title: "Servicio de Mentorías - Mentores",
    description: "",
    category: "Mentorías"
  },
  {
    id: "209c9f261fc680a5ab08e29c51bfd0c5",
    title: "Cómo configurar Calendly para convertirse en mentor",
    description: "",
    category: "Mentorías"
  },
  // Guías del Curso (Proyectos) en el orden solicitado
  {
    id: "1b6c9f261fc6804a936ec32675f9f5c4",
    title: "Te damos la Bienvenida a 4Geeks Academy",
    description: "",
    category: "Proyectos",
    courses: ["FS", "DS", "CS"]
  },
  {
    id: "1bac9f261fc680c4b22af5060c9499d9",
    title: "Guía para evaluar el progreso de los estudiantes",
    description: "",
    category: "Proyectos",
    courses: ["FS", "DS", "CS"]
  },
  {
    id: "7e831db823264e97bd66e172edb8fb6c",
    title: "Estructura de Clases Prework Fullstack",
    description: "",
    category: "Proyectos",
    courses: ["FS"]
  },
  {
    id: "4c315b2489434de1aaf9df59c9dbe990",
    title: "Estructura de Clases Prework Data Science",
    description: "",
    category: "Proyectos",
    courses: ["DS"]
  },
  {
    id: "c7071a03134d4bcab1dda66079a78e8e",
    title: "Guía para mentores sobre el proyecto final",
    description: "",
    category: "Proyectos",
    courses: ["FS"]
  },
  {
    id: "1b6c9f261fc680d7bd46d2f2b9cda4e3",
    title: "Requisitos individuales del proyecto final Full-Stack",
    description: "",
    category: "Proyectos",
    courses: ["FS"]
  },
  // How to
  {
    id: "ae1cefdb259843b98b27035bcc3d7060",
    title: "Guía para corregir proyectos",
    description: "",
    category: "How to",
    courses: ["FS", "DS"]
  },
  {
    id: "1b6c9f261fc6804b93e0c068e383bad7",
    title: "Guía para subir y organizar las clases en Youtube",
    description: "",
    category: "How to",
    courses: ["FS", "DS", "CS"]
  }
];

export default function Documentation() {
  const { store } = useGlobalReducer();
  const token = store.token;

  return (
    <EnhancedNotionViewer
      menuItems={MENU_ITEMS}
      token={token}
      title="Documentación y Guías"
    />
  );
} 