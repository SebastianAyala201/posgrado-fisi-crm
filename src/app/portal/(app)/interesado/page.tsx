'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BellRing, History, Mail, MessageCircle, Phone, ShieldCheck, Sparkles, StickyNote } from 'lucide-react';
import { useStore } from '@/lib/store';
import { TIPOS_INTERACCION, esCerrada, esPostulante, etapa, nombrePrograma } from '@/lib/domain/catalogos';
import { requiereMotivo, transicionesPermitidas } from '@/lib/domain/embudo';
import { predecir } from '@/lib/services/ia';
import type { EtapaId, TipoInteraccion } from '@/lib/domain/tipos';
import { EtapaBadge, Probabilidad, Vacio, fecha, fechaHora, iniciales, nombreCompleto } from '@/components/ui';
import MotivoModal from '@/components/MotivoModal';

const MEDIO = { correo: 'Correo', whatsapp: 'WhatsApp', llamada: 'Llamada' };

function Ficha() {
  const id = useSearchParams().get('id') ?? '';
  const { interesados, cambiarEtapa, agregarInteraccion, programarRecordatorio } = useStore();
  const x = interesados.find((i) => i.id === id);
  const [tipo, setTipo] = useState<TipoInteraccion>('WhatsApp');
  const [texto, setTexto] = useState('');
  const [motivoPara, setMotivoPara] = useState(false);
  const [tab, setTab] = useState<'bitacora' | 'historial'>('bitacora');

  if (!x) return <div className="pagina"><Vacio>No encontramos a este interesado. <Link href="/portal/interesados/" className="link">Volver a la bandeja</Link></Vacio></div>;

  const pred = predecir(x);
  const destinos = transicionesPermitidas(x.etapa);
  const mover = (e: EtapaId) => (requiereMotivo(e) ? setMotivoPara(true) : cambiarEtapa(x.id, e));
  const registrar = async (ev: React.FormEvent) => { ev.preventDefault(); if (!texto.trim()) return; await agregarInteraccion(x.id, tipo, texto.trim()); setTexto(''); };
  const sinCorreo = x.correo.endsWith('.local');

  return (
    <div className="pagina">
      <Link href="/portal/interesados/" className="link volver"><ArrowLeft size={16} /> Interesados</Link>
      <header className="ficha-head card">
        <span className="avatar-lg">{iniciales(x)}</span>
        <div className="ficha-titulo">
          <p className="eyebrow">Interesado #{x.id} · {nombrePrograma(x.programa)}</p>
          <h1>{nombreCompleto(x)}</h1>
          <div className="ficha-meta"><EtapaBadge id={x.etapa} /><span className="muted small">Llegó por {x.canal} · {fecha(x.creado)} · prefiere {MEDIO[x.medio]}</span></div>
        </div>
        <div className="ficha-contacto">
          <a className="btn btn-ghost btn-sm" href={`https://wa.me/51${x.telefono}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
          <span className="muted small">{x.telefono}</span>
        </div>
      </header>

      <div className="grid-ficha">
        <div className="col-izq">
          <section className="card">
            <h2>Mover en el embudo</h2>
            {destinos.length ? (
              <div className="destinos">
                {destinos.map((d) => (
                  <button key={d} className={`btn btn-sm ${d === 'no_convertido' ? 'btn-peligro' : 'btn-ghost'}`} onClick={() => mover(d)}>
                    {d === 'seguimiento' && x.etapa === 'no_convertido' ? 'Reabrir' : etapa(d).nombre}
                  </button>
                ))}
              </div>
            ) : <p className="muted">Proceso cerrado: fue admitido.</p>}
            {x.motivo && <p className="motivo">Motivo de no conversión: <b>{x.motivo}</b></p>}
          </section>

          <section className="card">
            <h2><BellRing size={18} /> Recordatorio</h2>
            <input type="date" aria-label="Fecha del próximo seguimiento" value={x.recordatorio ? x.recordatorio.slice(0, 10) : ''} disabled={esCerrada(x.etapa)}
              onChange={(e) => programarRecordatorio(x.id, e.target.value ? new Date(`${e.target.value}T09:00:00-05:00`).toISOString() : null)} />
            <p className="muted small">{x.recordatorio ? `Próximo seguimiento: ${fecha(x.recordatorio)}` : 'Sin seguimiento programado'}</p>
          </section>

          <section className="card card-ia">
            <h2><Sparkles size={18} /> Predicción IA</h2>
            {esPostulante(x.etapa) ? <p><b>Ya postuló.</b> La predicción se usa antes de la inscripción.</p> : <Probabilidad p={pred.p} />}
            {!esPostulante(x.etapa) && pred.factores.length > 0 && (
              <ul className="factores-lista">
                {pred.factores.map((f) => <li key={f.texto}><span className={f.efecto > 0 ? 'sube' : 'baja'}>{f.efecto > 0 ? '▲' : '▼'}</span>{f.texto}</li>)}
              </ul>
            )}
            <p className="muted small">Modelo de demostración. En la semana 15 lo reemplaza el endpoint <code>/predict</code>.</p>
          </section>

          <section className="card">
            <h2>Datos de contacto</h2>
            <ul className="datos">
              <li><Mail size={17} /> {sinCorreo ? <span className="muted">Sin correo</span> : x.correo}</li>
              <li><Phone size={17} /> {x.telefono}</li>
              <li><ShieldCheck size={17} /> Consentimiento {x.consentimiento.version} · {fecha(x.consentimiento.fecha)}</li>
            </ul>
            {x.mensaje && <p className="mensaje-inicial">“{x.mensaje}”</p>}
          </section>
        </div>

        <section className="card">
          <div className="tabs tabs-sub" role="tablist">
            <button role="tab" aria-selected={tab === 'bitacora'} className={`tab${tab === 'bitacora' ? ' on' : ''}`} onClick={() => setTab('bitacora')}><StickyNote size={16} /> Bitácora ({x.interacciones.length})</button>
            <button role="tab" aria-selected={tab === 'historial'} className={`tab${tab === 'historial' ? ' on' : ''}`} onClick={() => setTab('historial')}><History size={16} /> Historial de etapas</button>
          </div>
          {tab === 'bitacora' ? (
            <>
              <form className="nueva-inter" onSubmit={registrar}>
                <div className="chips">{TIPOS_INTERACCION.map((t) => <button type="button" key={t} aria-pressed={tipo === t} className={`chip${tipo === t ? ' on' : ''}`} onClick={() => setTipo(t)}>{t}</button>)}</div>
                <textarea rows={3} aria-label="Detalle de la interacción" placeholder="Ej. Se envió el brochure y consultó por facilidades de pago" value={texto} onChange={(e) => setTexto(e.target.value)} />
                <button className="btn btn-pri" disabled={!texto.trim()}>Registrar</button>
              </form>
              <ol className="timeline">
                {x.interacciones.map((i) => (<li key={i.id}><p className="tl-meta"><b>{i.tipo}</b> · {fechaHora(i.fecha)} · {i.autor}</p><p>{i.texto}</p></li>))}
              </ol>
              {!x.interacciones.length && <p className="muted">Sin interacciones todavía. Registra el primer contacto.</p>}
            </>
          ) : (
            <ol className="timeline">
              {x.historial.map((t, i) => (
                <li key={i}><p className="tl-meta">{fechaHora(t.fecha)} · {t.autor}</p>
                  <p>{t.de ? <>{etapa(t.de).nombre} → <b>{etapa(t.a).nombre}</b></> : <>Registro inicial en <b>{etapa(t.a).nombre}</b></>}{t.motivo && <> · motivo: {t.motivo}</>}</p></li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {motivoPara && <MotivoModal nombre={x.nombres} onCancelar={() => setMotivoPara(false)} onConfirmar={async (m) => { await cambiarEtapa(x.id, 'no_convertido', m); setMotivoPara(false); }} />}
    </div>
  );
}

export default function Pagina() {
  return <Suspense fallback={<div className="pantalla-carga">Cargando…</div>}><Ficha /></Suspense>;
}
