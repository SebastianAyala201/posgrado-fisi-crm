// Cálculo de indicadores (en la semana 14 los entrega la app `reporting` del backend).
import { CANALES, ETAPAS, MOTIVOS_NO_CONVERSION, PROGRAMAS } from './domain/catalogos';
import { HOY } from './data/mock';
import type { Interesado } from './domain/tipos';

export const LINEA_BASE = 25;

export function metricas(lista: Interesado[], ahora = HOY) {
  const total = lista.length;
  const postulantes = lista.filter((x) => x.etapa === 'postulante').length;
  const conResp = lista.filter((x) => x.horasPrimeraRespuesta != null);
  const promResp = conResp.length ? Math.round(conResp.reduce((a, x) => a + (x.horasPrimeraRespuesta ?? 0), 0) / conResp.length) : 0;
  const sinAtender = lista.filter((x) => x.etapa === 'nuevo' && ahora.getTime() - new Date(x.creado).getTime() > 48 * 3_600_000);
  const limite = ahora.getTime() + 2 * 86_400_000;
  const pendientes = lista
    .filter((x) => x.recordatorio && new Date(x.recordatorio).getTime() <= limite)
    .sort((a, b) => new Date(a.recordatorio!).getTime() - new Date(b.recordatorio!).getTime());

  // El embudo cuenta a quienes alcanzaron cada etapa (no solo a quienes están en ella)
  const orden = ['nuevo', 'contactado', 'seguimiento', 'documentos', 'postulante'] as const;
  const alcanzo = (x: Interesado, e: (typeof orden)[number]) => x.etapa === e || x.historial.some((t) => t.a === e);
  const embudo = orden.map((e) => ({ id: e, nombre: ETAPAS.find((s) => s.id === e)!.nombre, valor: lista.filter((x) => alcanzo(x, e)).length }));

  const porEtapa = ETAPAS.map((e) => ({ ...e, valor: lista.filter((x) => x.etapa === e.id).length }));
  const canales = CANALES.map((c) => {
    const del = lista.filter((x) => x.canal === c);
    return { nombre: c, valor: del.length, conv: del.length ? Math.round((del.filter((x) => x.etapa === 'postulante').length / del.length) * 100) : 0 };
  }).sort((a, b) => b.valor - a.valor);
  const motivos = MOTIVOS_NO_CONVERSION.map((m) => ({ nombre: m, valor: lista.filter((x) => x.motivo === m).length })).filter((m) => m.valor).sort((a, b) => b.valor - a.valor);
  const programas = PROGRAMAS.map((p) => {
    const del = lista.filter((x) => x.programa === p.id);
    const pos = del.filter((x) => x.etapa === 'postulante').length;
    return { id: p.id, nombre: p.corto, grado: p.grado, total: del.length, postulantes: pos, conv: del.length ? Math.round((pos / del.length) * 100) : 0 };
  }).sort((a, b) => b.total - a.total);

  // Registros por semana (últimas 10 semanas)
  const semanas = Array.from({ length: 10 }, (_, i) => {
    const fin = ahora.getTime() - (9 - i) * 7 * 86_400_000;
    const ini = fin - 7 * 86_400_000;
    const d = new Date(fin);
    return {
      nombre: d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', timeZone: 'America/Lima' }),
      registros: lista.filter((x) => { const t = new Date(x.creado).getTime(); return t > ini && t <= fin; }).length,
    };
  });

  return { total, postulantes, conversion: total ? Math.round((postulantes / total) * 100) : 0, promResp, sinAtender, pendientes, embudo, porEtapa, canales, motivos, programas, semanas };
}
