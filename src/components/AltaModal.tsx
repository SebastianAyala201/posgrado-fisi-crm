'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CANALES, PROGRAMAS, SIN_PROGRAMA } from '@/lib/domain/catalogos';
import type { Canal } from '@/lib/domain/tipos';

// Alta manual rápida: para interesados que escriben directo al WhatsApp.
// El canal es obligatorio para no perder la trazabilidad del origen.
export default function AltaModal({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: (id: string) => void }) {
  const { registrar, agregarInteraccion } = useStore();
  const [f, setF] = useState({ nombres: '', apellidos: '', telefono: '', correo: '', programa: '', canal: 'WhatsApp' as Canal, nota: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.nombres.trim() || !f.apellidos.trim()) return setError('Nombres y apellidos son obligatorios');
    if (!/^9\d{8}$/.test(f.telefono.replace(/\D/g, ''))) return setError('Celular de 9 dígitos que empiece con 9');
    if (!f.programa) return setError('Elige un programa');
    setGuardando(true);
    const correo = f.correo.trim() || `${f.telefono.replace(/\D/g, '')}@sin-correo.local`;
    const { id } = await registrar({ nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), telefono: f.telefono.replace(/\D/g, ''), correo, programa: f.programa, canal: f.canal, medio: 'whatsapp' });
    if (f.nota.trim()) await agregarInteraccion(id, 'Nota interna', f.nota.trim());
    onCreado(id);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={guardar} role="dialog" aria-modal="true" aria-labelledby="alta-t">
        <h2 id="alta-t">Registrar interesado</h2>
        <p className="muted">Para quien escribió directo al WhatsApp o llamó por teléfono.</p>
        <div className="fila-2">
          <div className="campo"><label htmlFor="a-n">Nombres</label><input id="a-n" value={f.nombres} onChange={set('nombres')} autoFocus /></div>
          <div className="campo"><label htmlFor="a-a">Apellidos</label><input id="a-a" value={f.apellidos} onChange={set('apellidos')} /></div>
        </div>
        <div className="fila-2">
          <div className="campo"><label htmlFor="a-t">Celular</label><input id="a-t" inputMode="numeric" value={f.telefono} onChange={set('telefono')} placeholder="9XXXXXXXX" /></div>
          <div className="campo"><label htmlFor="a-c">Correo <span className="opcional">(opcional)</span></label><input id="a-c" type="email" value={f.correo} onChange={set('correo')} /></div>
        </div>
        <div className="fila-2">
          <div className="campo"><label htmlFor="a-p">Programa</label>
            <select id="a-p" value={f.programa} onChange={set('programa')}>
              <option value="">Selecciona</option>
              {PROGRAMAS.map((p) => <option key={p.id} value={p.id}>{p.corto}</option>)}
              <option value={SIN_PROGRAMA}>Por definir</option>
            </select>
          </div>
          <div className="campo"><label htmlFor="a-ca">Canal de origen</label>
            <select id="a-ca" value={f.canal} onChange={set('canal')}>{CANALES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div className="campo"><label htmlFor="a-no">Nota inicial <span className="opcional">(opcional)</span></label><textarea id="a-no" rows={2} value={f.nota} onChange={set('nota')} placeholder="Ej. Preguntó por la maestría en IA" /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-pri" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar'}</button>
        </div>
      </form>
    </div>
  );
}
