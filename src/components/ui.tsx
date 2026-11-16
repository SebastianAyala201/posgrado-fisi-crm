'use client';
import type { CSSProperties, ReactNode } from 'react';
import { etapa } from '@/lib/domain/catalogos';
import type { EtapaId } from '@/lib/domain/tipos';
import { nivel } from '@/lib/services/ia';

export function EtapaBadge({ id }: { id: EtapaId }) {
  const e = etapa(id);
  return <span className="badge" style={{ '--c': e.color } as CSSProperties}>{e.nombre}</span>;
}

export function Probabilidad({ p, compacto = false }: { p: number; compacto?: boolean }) {
  const n = nivel(p);
  return (
    <span className="prob" title="Probabilidad estimada de postular">
      <span className="prob-bar"><span style={{ width: `${Math.round(p * 100)}%`, background: n.color }} /></span>
      <span style={{ color: n.color }}>{Math.round(p * 100)} %{compacto ? '' : ` · ${n.texto}`}</span>
    </span>
  );
}

export function Kpi({ etiqueta, valor, detalle, acento = false, icono }: { etiqueta: string; valor: ReactNode; detalle?: string; acento?: boolean; icono?: ReactNode }) {
  return (
    <div className={`kpi${acento ? ' kpi-acento' : ''}`}>
      <p className="kpi-label">{icono}{etiqueta}</p>
      <p className="kpi-valor">{valor}</p>
      {detalle && <p className="kpi-detalle">{detalle}</p>}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="vacio">{children}</p>;
}

export const nombreCompleto = (x: { nombres: string; apellidos: string }) => `${x.nombres} ${x.apellidos}`;
export const iniciales = (x: { nombres: string; apellidos: string }) => `${x.nombres[0]}${x.apellidos[0]}`;

const TZ = 'America/Lima';
export const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', timeZone: TZ }) : '—');
export const fechaHora = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '—');
