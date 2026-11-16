import type { EtapaId } from './tipos';

// Máquina de estados del embudo: la misma regla que change_stage() en el backend (app `leads`).
// Cualquier etapa abierta puede pasar a "No convertido" (con motivo); desde ahí solo se puede reabrir.
const TRANSICIONES: Record<EtapaId, EtapaId[]> = {
  nuevo: ['contactado', 'no_convertido'],
  contactado: ['seguimiento', 'inscrito', 'no_convertido'],
  seguimiento: ['inscrito', 'no_convertido'],
  inscrito: ['examen', 'no_convertido'],
  examen: ['entrevista', 'no_convertido'],
  entrevista: ['admitido', 'no_convertido'],
  admitido: [],
  no_convertido: ['seguimiento'], // reabrir
};

export const transicionesPermitidas = (desde: EtapaId) => TRANSICIONES[desde];
export const puedeMover = (desde: EtapaId, hacia: EtapaId) => TRANSICIONES[desde].includes(hacia);
export const requiereMotivo = (hacia: EtapaId) => hacia === 'no_convertido';
