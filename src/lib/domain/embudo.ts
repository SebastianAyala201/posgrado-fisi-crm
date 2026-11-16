import type { EtapaId } from './tipos';

// Máquina de estados del embudo (misma regla que change_stage() en el backend).
// Se puede avanzar, retroceder un paso o cerrar como "No convertido" (con motivo).
const ORDEN: EtapaId[] = ['nuevo', 'contactado', 'seguimiento', 'documentos', 'postulante'];

export function transicionesPermitidas(desde: EtapaId): EtapaId[] {
  if (desde === 'postulante') return [];
  if (desde === 'no_convertido') return ['seguimiento']; // reabrir
  const i = ORDEN.indexOf(desde);
  const destinos = ORDEN.slice(i + 1);
  if (i > 0) destinos.unshift(ORDEN[i - 1]);
  return [...destinos, 'no_convertido'];
}

export function puedeMover(desde: EtapaId, hacia: EtapaId) {
  return transicionesPermitidas(desde).includes(hacia);
}

export const requiereMotivo = (hacia: EtapaId) => hacia === 'no_convertido';
