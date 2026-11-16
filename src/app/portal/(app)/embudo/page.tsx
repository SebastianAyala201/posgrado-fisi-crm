'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { BellRing, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ETAPAS, PROGRAMAS, etapa, nombrePrograma } from '@/lib/domain/catalogos';
import { puedeMover, requiereMotivo, transicionesPermitidas } from '@/lib/domain/embudo';
import { probabilidad } from '@/lib/services/ia';
import type { EtapaId, Interesado } from '@/lib/domain/tipos';
import { Probabilidad, fecha, nombreCompleto } from '@/components/ui';
import MotivoModal from '@/components/MotivoModal';

export default function Embudo() {
  const { interesados, cambiarEtapa } = useStore();
  const [arrastrado, setArrastrado] = useState<Interesado | null>(null);
  const [sobre, setSobre] = useState<EtapaId | null>(null);
  const [pendiente, setPendiente] = useState<Interesado | null>(null);
  const [q, setQ] = useState('');
  const [prog, setProg] = useState('');

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return interesados.filter((x) => (!t || nombreCompleto(x).toLowerCase().includes(t)) && (!prog || x.programa === prog));
  }, [interesados, q, prog]);

  const mover = (x: Interesado, hacia: EtapaId) => {
    if (!puedeMover(x.etapa, hacia)) return;
    if (requiereMotivo(hacia)) setPendiente(x);
    else cambiarEtapa(x.id, hacia);
  };

  return (
    <div className="pagina pagina-ancha">
      <header className="pag-head">
        <div><p className="eyebrow">Pipeline de conversión</p><h1>Embudo de admisión</h1></div>
        <div className="head-acciones">
          <label className="buscar buscar-sm"><Search size={16} /><input placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en el embudo" /></label>
          <select value={prog} onChange={(e) => setProg(e.target.value)} aria-label="Programa"><option value="">Todos los programas</option>{PROGRAMAS.map((p) => <option key={p.id} value={p.id}>{p.corto}</option>)}</select>
        </div>
      </header>
      <p className="muted small ayuda-kanban">Arrastra una tarjeta a otra columna o usa el selector de la tarjeta. Pasar a <b>No convertido</b> pide un motivo.</p>

      <div className="kanban">
        {ETAPAS.map((e) => {
          const items = visibles.filter((x) => x.etapa === e.id).sort((a, b) => probabilidad(b) - probabilidad(a));
          const valido = arrastrado ? puedeMover(arrastrado.etapa, e.id) : true;
          return (
            <section key={e.id} aria-label={e.nombre}
              className={`columna${sobre === e.id && valido ? ' sobre' : ''}${arrastrado && !valido && arrastrado.etapa !== e.id ? ' bloqueada' : ''}`}
              onDragOver={(ev) => { if (valido) { ev.preventDefault(); setSobre(e.id); } }}
              onDragLeave={() => setSobre(null)}
              onDrop={(ev) => { ev.preventDefault(); setSobre(null); if (arrastrado) mover(arrastrado, e.id); setArrastrado(null); }}>
              <header className="col-head" style={{ '--c': e.color } as CSSProperties}>
                <span>{e.nombre}</span><span className="contador">{items.length}</span>
              </header>
              <p className="col-desc">{e.descripcion}</p>
              <div className="col-body">
                {items.map((x) => (
                  <article key={x.id} className="tarjeta" draggable
                    onDragStart={(ev) => { ev.dataTransfer.setData('text/plain', x.id); setArrastrado(x); }}
                    onDragEnd={() => { setArrastrado(null); setSobre(null); }}>
                    <Link href={`/portal/interesado/?id=${x.id}`} className="t-nombre">{nombreCompleto(x)}</Link>
                    <p className="muted small">{nombrePrograma(x.programa)} · {x.canal}</p>
                    {x.motivo && <p className="motivo small">{x.motivo}</p>}
                    {x.recordatorio && <p className={`t-rec${new Date(x.recordatorio) < new Date() ? ' vencido' : ''}`}><BellRing size={13} /> {fecha(x.recordatorio)}</p>}
                    <Probabilidad p={probabilidad(x)} />
                    {transicionesPermitidas(x.etapa).length > 0 && (
                      <select className="t-mover" value="" onChange={(ev) => mover(x, ev.target.value as EtapaId)} aria-label={`Mover a ${nombreCompleto(x)}`}>
                        <option value="" disabled>Mover a…</option>
                        {transicionesPermitidas(x.etapa).map((d) => <option key={d} value={d}>{x.etapa === 'no_convertido' ? 'Reabrir (En seguimiento)' : etapa(d).nombre}</option>)}
                      </select>
                    )}
                  </article>
                ))}
                {!items.length && <p className="col-vacia">Sin interesados</p>}
              </div>
            </section>
          );
        })}
      </div>

      {pendiente && <MotivoModal nombre={pendiente.nombres} onCancelar={() => setPendiente(null)} onConfirmar={async (m) => { await cambiarEtapa(pendiente.id, 'no_convertido', m); setPendiente(null); }} />}
    </div>
  );
}
