'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CANALES, PROGRAMAS, SIN_PROGRAMA, nombrePrograma } from '@/lib/domain/catalogos';
import type { Canal, MedioContacto } from '@/lib/domain/tipos';

const VACIO = { nombres: '', apellidos: '', correo: '', telefono: '', programa: '', medio: 'whatsapp' as MedioContacto, canal: '' as Canal | '', mensaje: '', acepta: false };
const MEDIOS: { id: MedioContacto; texto: string; icono: ReactNode }[] = [
  { id: 'whatsapp', texto: 'WhatsApp', icono: <MessageCircle size={16} /> },
  { id: 'correo', texto: 'Correo', icono: <Mail size={16} /> },
  { id: 'llamada', texto: 'Llamada', icono: <Phone size={16} /> },
];

export default function Formulario({ programaInicial = '' }: { programaInicial?: string }) {
  const { registrar } = useStore();
  const [f, setF] = useState({ ...VACIO, programa: programaInicial });
  const [err, setErr] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<{ id: string; nombre: string; correo: string; programa: string } | null>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };

  const validar = () => {
    const e: Record<string, string> = {};
    if (f.nombres.trim().length < 2) e.nombres = 'Escribe tus nombres';
    if (f.apellidos.trim().length < 2) e.apellidos = 'Escribe tus apellidos';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo.trim())) e.correo = 'Revisa tu correo';
    const tel = f.telefono.replace(/\D/g, '');
    if (f.medio !== 'correo' && !/^9\d{8}$/.test(tel)) e.telefono = 'Celular de 9 dígitos que empiece con 9';
    if (f.medio === 'correo' && tel && !/^9\d{8}$/.test(tel)) e.telefono = 'Celular de 9 dígitos que empiece con 9';
    if (!f.programa) e.programa = 'Elige un programa o la opción de orientación';
    if (!f.acepta) e.acepta = 'Necesitamos tu autorización para contactarte';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    try {
      const r = await registrar({
        nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), correo: f.correo.trim().toLowerCase(),
        telefono: f.telefono.replace(/\D/g, ''), programa: f.programa, medio: f.medio,
        canal: (f.canal || 'Web') as Canal, mensaje: f.mensaje.trim() || undefined,
      });
      setListo({ id: r.id, nombre: f.nombres.trim().split(' ')[0], correo: f.correo.trim(), programa: nombrePrograma(f.programa, false) });
    } catch (e) {
      setErr({ general: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <div className="card form-card exito" role="status">
        <div className="exito-icono"><CheckCircle2 size={40} /></div>
        <h3>¡Gracias, {listo.nombre}!</h3>
        <p>Recibimos tu solicitud sobre <b>{listo.programa}</b>. Un asesor te contactará pronto y te enviaremos la información a <b>{listo.correo}</b>.</p>
        <p className="codigo">Código de registro <b>#{listo.id}</b></p>
        <button className="btn btn-ghost" onClick={() => { setListo(null); setF({ ...VACIO }); }}>Registrar otra solicitud</button>
      </div>
    );
  }

  return (
    <form className="card form-card" onSubmit={enviar} noValidate>
      <div className="fila-2">
        <Campo id="nombres" label="Nombres" error={err.nombres}><input id="nombres" autoComplete="given-name" value={f.nombres} onChange={(e) => set('nombres', e.target.value)} /></Campo>
        <Campo id="apellidos" label="Apellidos" error={err.apellidos}><input id="apellidos" autoComplete="family-name" value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} /></Campo>
      </div>
      <Campo id="correo" label="Correo electrónico" error={err.correo}><input id="correo" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" value={f.correo} onChange={(e) => set('correo', e.target.value)} /></Campo>
      <Campo id="programa" label="Programa de interés" error={err.programa}>
        <select id="programa" value={f.programa} onChange={(e) => set('programa', e.target.value)}>
          <option value="">Selecciona un programa</option>
          <optgroup label="Maestrías">{PROGRAMAS.filter((p) => p.grado === 'Maestría').map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</optgroup>
          <optgroup label="Doctorados">{PROGRAMAS.filter((p) => p.grado === 'Doctorado').map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</optgroup>
          <option value={SIN_PROGRAMA}>Aún no lo decido; necesito orientación</option>
        </select>
      </Campo>
      <fieldset className="campo">
        <legend>¿Cómo prefieres que te contactemos?</legend>
        <div className="segmentado">
          {MEDIOS.map((m) => (
            <button type="button" key={m.id} aria-pressed={f.medio === m.id} className={f.medio === m.id ? 'on' : ''} onClick={() => set('medio', m.id)}>{m.icono}{m.texto}</button>
          ))}
        </div>
      </fieldset>
      <Campo id="telefono" label={`Celular${f.medio === 'correo' ? ' (opcional)' : ''}`} error={err.telefono}>
        <input id="telefono" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XXX" maxLength={11} value={f.telefono} onChange={(e) => set('telefono', e.target.value)} />
      </Campo>
      <fieldset className="campo">
        <legend>¿Cómo nos conociste? <span className="opcional">(opcional)</span></legend>
        <div className="chips">
          {CANALES.map((c) => <button type="button" key={c} aria-pressed={f.canal === c} className={`chip${f.canal === c ? ' on' : ''}`} onClick={() => set('canal', f.canal === c ? '' : c)}>{c}</button>)}
        </div>
      </fieldset>
      <Campo id="mensaje" label={<>Mensaje <span className="opcional">(opcional)</span></>}>
        <textarea id="mensaje" rows={3} maxLength={500} placeholder="Cuéntanos qué te gustaría saber" value={f.mensaje} onChange={(e) => set('mensaje', e.target.value)} />
        <small className="contador-txt">{f.mensaje.length}/500</small>
      </Campo>
      <label className={`check${err.acepta ? ' check-err' : ''}`}>
        <input type="checkbox" checked={f.acepta} onChange={(e) => set('acepta', e.target.checked)} />
        <span>Autorizo el uso de mis datos para atender mi solicitud de admisión. <Link href="/privacidad/">Uso de mis datos</Link></span>
      </label>
      {err.acepta && <small className="error">{err.acepta}</small>}
      {err.general && <p className="error">{err.general}</p>}
      <button className="btn btn-pri btn-full btn-lg" disabled={enviando}>{enviando ? 'Enviando…' : 'Solicitar información'}</button>
      <p className="seguridad"><ShieldCheck size={14} /> Protegido contra bots con Cloudflare Turnstile</p>
    </form>
  );
}

function Campo({ id, label, error, children }: { id: string; label: ReactNode; error?: string; children: ReactNode }) {
  return (
    <div className={`campo${error ? ' con-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <small className="error" role="alert">{error}</small>}
    </div>
  );
}
