'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, UserPlus, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CANALES, ETAPAS, PROGRAMAS, nombrePrograma } from '@/lib/domain/catalogos';
import { probabilidad } from '@/lib/services/ia';
import { EtapaBadge, Probabilidad, Vacio, fecha, iniciales, nombreCompleto } from '@/components/ui';
import AltaModal from '@/components/AltaModal';

function Bandeja() {
  const { interesados } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [prog, setProg] = useState('');
  const [etp, setEtp] = useState('');
  const [can, setCan] = useState('');
  const [orden, setOrden] = useState<'reciente' | 'prob'>('reciente');
  const [alta, setAlta] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { if (params.get('nuevo')) setAlta(true); }, [params]);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return interesados
      .filter((x) => !t || nombreCompleto(x).toLowerCase().includes(t) || x.correo.includes(t) || x.telefono.includes(t))
      .filter((x) => (!prog || x.programa === prog) && (!etp || x.etapa === etp) && (!can || x.canal === can))
      .map((x) => ({ x, p: probabilidad(x) }))
      .sort((a, b) => (orden === 'prob' ? b.p - a.p : new Date(b.x.creado).getTime() - new Date(a.x.creado).getTime()));
  }, [interesados, q, prog, etp, can, orden]);

  const copiarCsv = async () => {
    const filas = [['id', 'nombres', 'apellidos', 'correo', 'telefono', 'programa', 'canal', 'etapa', 'motivo', 'registro'],
      ...lista.map(({ x }) => [x.id, x.nombres, x.apellidos, x.correo, x.telefono, nombrePrograma(x.programa), x.canal, x.etapa, x.motivo ?? '', x.creado.slice(0, 10)])];
    try { await navigator.clipboard.writeText(filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin portapapeles */ }
  };

  const filtrando = q || prog || etp || can;

  return (
    <div className="pagina">
      <header className="pag-head">
        <div><p className="eyebrow">Bandeja unificada</p><h1>Interesados</h1></div>
        <div className="head-acciones">
          <button className="btn btn-ghost" onClick={copiarCsv}><Download size={16} /> {copiado ? '¡Copiado!' : 'Copiar CSV'}</button>
          <button className="btn btn-pri" onClick={() => setAlta(true)}><UserPlus size={17} /> Registrar</button>
        </div>
      </header>

      <div className="filtros card">
        <label className="buscar"><Search size={18} /><input placeholder="Buscar por nombre, correo o celular" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" /></label>
        <select value={prog} onChange={(e) => setProg(e.target.value)} aria-label="Programa"><option value="">Todos los programas</option>{PROGRAMAS.map((p) => <option key={p.id} value={p.id}>{p.corto}</option>)}</select>
        <select value={etp} onChange={(e) => setEtp(e.target.value)} aria-label="Etapa"><option value="">Todas las etapas</option>{ETAPAS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
        <select value={can} onChange={(e) => setCan(e.target.value)} aria-label="Canal"><option value="">Todos los canales</option>{CANALES.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={orden} onChange={(e) => setOrden(e.target.value as 'reciente' | 'prob')} aria-label="Orden"><option value="reciente">Más recientes</option><option value="prob">Mayor probabilidad (IA)</option></select>
      </div>
      <p className="muted small resultado">{lista.length} de {interesados.length} interesados{filtrando && <> · <button className="link" onClick={() => { setQ(''); setProg(''); setEtp(''); setCan(''); }}>Limpiar filtros</button></>}</p>

      <div className="card sin-pad">
        <table className="tabla tabla-click">
          <thead><tr><th>Interesado</th><th>Programa</th><th>Canal</th><th>Etapa</th><th>Prob. de postular</th><th>Registro</th></tr></thead>
          <tbody>
            {lista.map(({ x, p }) => (
              <tr key={x.id} onClick={() => router.push(`/portal/interesado/?id=${x.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && router.push(`/portal/interesado/?id=${x.id}`)}>
                <td data-l="Interesado"><div className="persona"><span className="avatar-sm">{iniciales(x)}</span><span><b>{nombreCompleto(x)}</b><br /><span className="muted small">{x.correo.endsWith('.local') ? x.telefono : x.correo}</span></span></div></td>
                <td data-l="Programa">{nombrePrograma(x.programa)}</td>
                <td data-l="Canal">{x.canal}</td>
                <td data-l="Etapa"><EtapaBadge id={x.etapa} /></td>
                <td data-l="Prob."><Probabilidad p={p} /></td>
                <td data-l="Registro">{fecha(x.creado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!lista.length && <Vacio>No hay interesados con esos filtros.</Vacio>}
      </div>

      {alta && <AltaModal onCerrar={() => { setAlta(false); router.replace('/portal/interesados/'); }} onCreado={(id) => router.push(`/portal/interesado/?id=${id}`)} />}
    </div>
  );
}

export default function Pagina() {
  return <Suspense fallback={<div className="pantalla-carga">Cargando…</div>}><Bandeja /></Suspense>;
}
