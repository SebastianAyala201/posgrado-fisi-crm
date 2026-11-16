// Servicios de IA del frontend.
// - probabilidadPostular: regla de demostración. En la semana 15 se reemplaza por
//   POST /api/v1/ia/predict/ (modelo scikit-learn entrenado con los datos 2025).
// - responderAsistente: preguntas frecuentes por reglas. En la semana 15 pasa a un LLM.
import { HOY } from '../data/mock';
import type { Interesado } from '../domain/tipos';

const BASE: Record<Interesado['etapa'], number> = { nuevo: 0.04, contactado: 0.06, seguimiento: 0.12, documentos: 0.42, postulante: 0.98, no_convertido: 0.02 };

export interface Prediccion { p: number; factores: { texto: string; efecto: number }[] }

export function predecir(x: Interesado, ahora = HOY): Prediccion {
  const factores: Prediccion['factores'] = [];
  let p = BASE[x.etapa];
  const n = Math.min(x.interacciones.length, 4);
  if (n) { factores.push({ texto: `${x.interacciones.length} contacto(s) registrados`, efecto: n * 0.02 }); p += n * 0.02; }
  if (x.horasPrimeraRespuesta != null) {
    const e = x.horasPrimeraRespuesta <= 12 ? 0.07 : x.horasPrimeraRespuesta > 36 ? -0.07 : 0;
    if (e) { factores.push({ texto: `Primera respuesta en ${x.horasPrimeraRespuesta} h`, efecto: e }); p += e; }
  }
  const ref = x.ultimoContacto ?? x.creado;
  const diasSin = (ahora.getTime() - new Date(ref).getTime()) / 86_400_000;
  if (!['postulante', 'no_convertido'].includes(x.etapa) && diasSin > 14) { factores.push({ texto: `${Math.round(diasSin)} días sin contacto`, efecto: -0.1 }); p -= 0.1; }
  if (x.canal === 'LinkedIn' || x.canal === 'Referido') { factores.push({ texto: `Llegó por ${x.canal}`, efecto: 0.04 }); p += 0.04; }
  return { p: Math.max(0.01, Math.min(0.99, p)), factores };
}

export const probabilidad = (x: Interesado) => predecir(x).p;

export function nivel(p: number) {
  if (p >= 0.4) return { texto: 'Alta', color: 'var(--ok)' };
  if (p >= 0.15) return { texto: 'Media', color: 'var(--warn)' };
  return { texto: 'Baja', color: 'var(--bad)' };
}

const FAQ: { claves: string[]; respuesta: string }[] = [
  { claves: ['costo', 'precio', 'pago', 'pension', 'cuanto', 'cuota'], respuesta: 'Los costos dependen de cada programa. Al registrarte en el formulario te enviamos el brochure con el detalle de pagos.' },
  { claves: ['requisito', 'documento', 'titulo', 'bachiller', 'grado'], respuesta: 'Para el doctorado se requiere el grado de maestro o magíster. Un asesor te enviará la lista completa de requisitos de tu programa.' },
  { claves: ['fecha', 'examen', 'cuando', 'inscrip', 'cronograma', 'admision'], respuesta: 'El proceso de admisión tiene tres etapas: inscripción, evaluación y entrevista. Al registrarte te avisamos las fechas del próximo proceso.' },
  { claves: ['horario', 'clase', 'virtual', 'presencial', 'modalidad'], respuesta: 'El horario y la modalidad dependen de cada programa. Un asesor te los confirmará junto con el brochure.' },
  { claves: ['programa', 'maestria', 'doctorado', 'mencion', 'ofrecen'], respuesta: 'Ofrecemos 5 maestrías (Gestión de TI, Ingeniería de Software, IA, Analítica de Datos e IA, Ciberseguridad) y 2 doctorados (Ingeniería de Sistemas y Deep Tech).' },
  { claves: ['hola', 'buenas', 'buenos'], respuesta: '¡Hola! ¿Sobre qué programa te gustaría saber? Puedo contarte de costos, requisitos, fechas o modalidad.' },
];

export function responderAsistente(texto: string) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return FAQ.find((f) => f.claves.some((c) => t.includes(c)))?.respuesta
    ?? 'Buena pregunta. Déjanos tus datos en el formulario y un asesor de la Unidad de Posgrado te escribirá.';
}
