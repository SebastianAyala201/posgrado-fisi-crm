'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { MODO_DEMO } from '@/lib/services/repositorio';
import Logo from '@/components/Logo';

export default function Login() {
  const { login } = useStore();
  const router = useRouter();
  const [u, setU] = useState(MODO_DEMO ? 'personal@upg' : '');
  const [c, setC] = useState(MODO_DEMO ? 'demo123' : '');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try { await login(u.trim(), c); router.replace('/portal/'); }
    catch (er) { setError((er as Error).message); setCargando(false); }
  };

  return (
    <div className="login">
      <div className="login-lado" aria-hidden="true">
        <Logo claro />
        <div>
          <h2>Que ningún interesado se pierda</h2>
          <p>Registra, da seguimiento y mide la conversión de cada interesado, desde que pregunta hasta que postula.</p>
        </div>
        <p className="login-pie">Unidad de Posgrado · FISI – UNMSM</p>
      </div>
      <main className="login-form">
        <form className="login-card" onSubmit={entrar}>
          <div className="solo-movil"><Logo /></div>
          <h1>Portal de admisión</h1>
          <p className="muted">Acceso para el personal de la UPG y la Dirección de Posgrado</p>
          <div className="campo"><label htmlFor="u">Usuario</label><input id="u" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} /></div>
          <div className="campo"><label htmlFor="c">Contraseña</label><input id="c" type="password" autoComplete="current-password" value={c} onChange={(e) => setC(e.target.value)} /></div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-pri btn-full btn-lg" disabled={cargando}><Lock size={16} /> {cargando ? 'Ingresando…' : 'Ingresar'}</button>
          {MODO_DEMO && (
            <div className="demo-cuentas">
              <p><b>Cuentas de demostración</b> · contraseña <code>demo123</code></p>
              <div className="chips">
                <button type="button" className={`chip${u === 'personal@upg' ? ' on' : ''}`} onClick={() => setU('personal@upg')}>Personal UPG</button>
                <button type="button" className={`chip${u === 'director@upg' ? ' on' : ''}`} onClick={() => setU('director@upg')}>Director</button>
              </div>
            </div>
          )}
          <Link href="/" className="link volver-sitio"><ArrowLeft size={16} /> Volver al sitio público</Link>
        </form>
      </main>
    </div>
  );
}
