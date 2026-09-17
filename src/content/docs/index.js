import responsabilidadesMentores from './responsabilidades-mentores.md?raw'
import servicioMentoriasMentores from './servicio-mentorias-mentores.md?raw'
import calendlyMentor from './calendly-mentor.md?raw'
import bienvenida4geeks from './bienvenida-4geeks.md?raw'
import evaluarProgresoEstudiantes from './evaluar-progreso-estudiantes.md?raw'
import corregirProyectos from './corregir-proyectos.md?raw'

/** @type {Record<string, string>} */
export const DOC_CONTENT_BY_SLUG = {
  'responsabilidades-mentores': responsabilidadesMentores,
  'servicio-mentorias-mentores': servicioMentoriasMentores,
  'calendly-mentor': calendlyMentor,
  'bienvenida-4geeks': bienvenida4geeks,
  'evaluar-progreso-estudiantes': evaluarProgresoEstudiantes,
  'corregir-proyectos': corregirProyectos,
}
