'use client';
import { useEffect, useState } from 'react';
import { MOTIVOS_NO_CONVERSION } from '@/lib/domain/catalogos';

export default function MotivoModal({ nombre, onConfirmar, onCancelar }: { nombre: string; onConfirmar: (m: string) => void; onCancelar: () => void }) {
  const [m, setM] = useState('');
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCancelar]);

  return (
    <div className="modal-fondo" onClick={onCancelar}>
      <div className="card modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="motivo-titulo">
        <h2 id="motivo-titulo">¿Por qué no postula {nombre}?</h2>
        <p className="muted">El motivo es obligatorio: así se sabe por qué se pierde el 75 % de interesados.</p>
        <div className="opciones" role="radiogroup">
          {MOTIVOS_NO_CONVERSION.map((x) => (
            <label key={x} className={`opcion${m === x ? ' on' : ''}`}>
              <input type="radio" name="motivo" checked={m === x} onChange={() => setM(x)} /> {x}
            </label>
          ))}
        </div>
        <div className="acciones">
          <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-pri" disabled={!m} onClick={() => onConfirmar(m)}>Marcar como no convertido</button>
        </div>
      </div>
    </div>
  );
}
