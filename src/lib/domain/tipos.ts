// Tipos del dominio. Reflejan los modelos del backend (app `leads` de Django).

export type EtapaId = 'nuevo' | 'contactado' | 'seguimiento' | 'documentos' | 'postulante' | 'no_convertido';
export type Canal = 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok' | 'WhatsApp' | 'Web' | 'Referido';
export type MedioContacto = 'correo' | 'whatsapp' | 'llamada';
export type TipoInteraccion = 'WhatsApp' | 'Llamada' | 'Correo' | 'Nota interna';
export type Rol = 'personal' | 'director';

export interface Programa {
  id: string;
  nombre: string;
  corto: string;
  grado: 'Maestría' | 'Doctorado';
  area: string;
  descripcion: string;
}

export interface Interaccion {
  id: string;
  tipo: TipoInteraccion;
  texto: string;
  fecha: string;
  autor: string;
}

export interface Transicion {
  de: EtapaId | null;
  a: EtapaId;
  fecha: string;
  autor: string;
  motivo?: string;
}

export interface Interesado {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  programa: string;
  canal: Canal;
  medio: MedioContacto;
  mensaje?: string;
  etapa: EtapaId;
  motivo: string | null;
  creado: string;
  ultimoContacto: string | null;
  recordatorio: string | null;
  horasPrimeraRespuesta: number | null;
  interacciones: Interaccion[];
  historial: Transicion[];
  consentimiento: { fecha: string; version: string };
}

export interface NuevoRegistro {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  programa: string;
  canal: Canal;
  medio: MedioContacto;
  mensaje?: string;
}

export interface Sesion {
  token: string;
  nombre: string;
  rol: Rol;
}
