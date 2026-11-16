import type { Canal, EtapaId, Programa, TipoInteraccion } from './tipos';

// Oferta de la Unidad de Posgrado FISI (fuente: nota de prensa, julio 2026).
export const PROGRAMAS: Programa[] = [
  { id: 'mgti', grado: 'Maestría', area: 'Gestión', nombre: 'Maestría en Gestión de Tecnología de la Información', corto: 'Gestión de TI', descripcion: 'Gobierno, estrategia y gestión de servicios de TI para organizaciones públicas y privadas.' },
  { id: 'msw', grado: 'Maestría', area: 'Software', nombre: 'Maestría en Ingeniería de Software', corto: 'Ingeniería de Software', descripcion: 'Arquitectura, calidad y procesos para construir software a escala.' },
  { id: 'mia', grado: 'Maestría', area: 'IA', nombre: 'Maestría en Inteligencia Artificial', corto: 'Inteligencia Artificial', descripcion: 'Aprendizaje automático, aprendizaje profundo y aplicaciones de la IA.' },
  { id: 'madi', grado: 'Maestría', area: 'Datos', nombre: 'Maestría en Analítica de Datos e Inteligencia Artificial', corto: 'Analítica de Datos e IA', descripcion: 'Ciencia de datos, analítica avanzada y modelos para la toma de decisiones.' },
  { id: 'mcs', grado: 'Maestría', area: 'Seguridad', nombre: 'Maestría en Ciberseguridad', corto: 'Ciberseguridad', descripcion: 'Protección de la información, gestión de riesgos y respuesta a incidentes.' },
  { id: 'dis', grado: 'Doctorado', area: 'Investigación', nombre: 'Doctorado en Ingeniería de Sistemas', corto: 'Doctorado Ing. de Sistemas', descripcion: 'Investigación original en ingeniería de sistemas e informática.' },
  { id: 'ddt', grado: 'Doctorado', area: 'IA', nombre: 'Doctorado en Deep Tech – Tecnologías Profundas con Enfoque en IA', corto: 'Doctorado Deep Tech', descripcion: 'Programa multidisciplinario abierto a profesionales de ciencias e ingeniería.' },
];

export const CANALES: Canal[] = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'WhatsApp', 'Web', 'Referido'];

export const ETAPAS: { id: EtapaId; nombre: string; color: string; descripcion: string }[] = [
  { id: 'nuevo', nombre: 'Nuevo', color: '#64748B', descripcion: 'Se registró y aún no se le contacta' },
  { id: 'contactado', nombre: 'Contactado', color: '#2563EB', descripcion: 'Recibió brochure e información' },
  { id: 'seguimiento', nombre: 'En seguimiento', color: '#C2410C', descripcion: 'Conversación activa con un asesor' },
  { id: 'inscrito', nombre: 'Inscrito', color: '#7C3AED', descripcion: 'Se inscribió: ya es postulante' },
  { id: 'examen', nombre: 'Examen', color: '#0E7490', descripcion: 'Rindió o rendirá la evaluación' },
  { id: 'entrevista', nombre: 'Entrevista', color: '#0369A1', descripcion: 'Pasó a la entrevista' },
  { id: 'admitido', nombre: 'Admitido', color: '#0F766E', descripcion: 'Ingresó al programa' },
  { id: 'no_convertido', nombre: 'No convertido', color: '#9F1239', descripcion: 'Salió del proceso; el motivo queda registrado' },
];

// Etapas en las que el interesado ya postuló (cuentan para la conversión)
export const ETAPAS_POSTULANTE: EtapaId[] = ['inscrito', 'examen', 'entrevista', 'admitido'];
// Etapas abiertas antes de postular (las que predice la IA)
export const ETAPAS_PREVIAS: EtapaId[] = ['nuevo', 'contactado', 'seguimiento'];
export const esPostulante = (e: EtapaId) => ETAPAS_POSTULANTE.includes(e);
export const esCerrada = (e: EtapaId) => e === 'admitido' || e === 'no_convertido';

export const MOTIVOS_NO_CONVERSION = [
  'Costo del programa',
  'Horarios no compatibles',
  'Eligió otra universidad',
  'No cumple requisitos',
  'Postergó para otro proceso',
  'Dejó de responder',
];

export const TIPOS_INTERACCION: TipoInteraccion[] = ['WhatsApp', 'Llamada', 'Correo', 'Nota interna'];

export const VERSION_CONSENTIMIENTO = 'v1-2026-11';

export const SIN_PROGRAMA = 'orientacion';

export const etapa = (id: EtapaId) => ETAPAS.find((e) => e.id === id)!;
export const programa = (id: string) => PROGRAMAS.find((p) => p.id === id);
export const nombrePrograma = (id: string, corto = true) => {
  const p = programa(id);
  return p ? (corto ? p.corto : p.nombre) : 'Por definir (orientación)';
};
