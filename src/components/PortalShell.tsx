'use client';
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, KanbanSquare, Sparkles, LogOut, Globe, RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import { MODO_DEMO } from '@/lib/services/repositorio';
import Logo from './Logo';

const NAV = [
  { href: '/portal/', icon: LayoutDashboard, texto: 'Dashboard' },
  { href: '/portal/interesados/', icon: Users, texto: 'Interesados' },
  { href: '/portal/embudo/', icon: KanbanSquare, texto: 'Embudo' },
  { href: '/portal/ia/', icon: Sparkles, texto: 'IA' },
];

export default function PortalShell({ children }: { children: ReactNode }) {
  const { sesion, sesionLista, logout, cargando, reiniciarDemo } = useStore();
  const router = useRouter();
  const ruta = usePathname();

  useEffect(() => { if (sesionLista && !sesion) router.replace('/portal/login/'); }, [sesion, sesionLista, router]);
  if (!sesionLista || !sesion) return <div className="pantalla-carga">Cargando…</div>;

  const activo = (href: string) => (href === '/portal/' ? ruta === '/portal' || ruta === '/portal/' : ruta.startsWith(href.replace(/\/$/, '')) || (href === '/portal/interesados/' && ruta.startsWith('/portal/interesado')));

  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo claro />
        <nav aria-label="Portal">
          {NAV.map(({ href, icon: Icon, texto }) => (
            <Link key={href} href={href} className={`nav-item${activo(href) ? ' active' : ''}`} aria-current={activo(href) ? 'page' : undefined}><Icon size={20} /><span>{texto}</span></Link>
          ))}
        </nav>
        <div className="sidebar-pie">
          {MODO_DEMO && (
            <button className="nav-item" onClick={() => reiniciarDemo()} title="Vuelve a cargar los datos de prueba"><RotateCcw size={18} /><span>Restaurar demo</span></button>
          )}
          <Link href="/" className="nav-item"><Globe size={18} /><span>Ver sitio público</span></Link>
          <div className="usuario">
            <div className="avatar">{sesion.nombre[0]}</div>
            <div className="usuario-txt"><p>{sesion.nombre}</p><p>{sesion.rol === 'director' ? 'Director' : 'Personal UPG'}</p></div>
            <button className="icon-btn" onClick={() => { logout(); router.replace('/portal/login/'); }} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      <div className="contenido">
        <header className="topbar">
          <Logo />
          <button className="icon-btn" onClick={() => { logout(); router.replace('/portal/login/'); }} aria-label="Cerrar sesión"><LogOut size={20} /></button>
        </header>
        {MODO_DEMO && <p className="banner-demo">Modo demostración · datos ficticios guardados en este navegador</p>}
        {cargando ? <div className="pantalla-carga">Cargando datos…</div> : children}
      </div>

      <nav className="bottom-nav" aria-label="Portal">
        {NAV.map(({ href, icon: Icon, texto }) => (
          <Link key={href} href={href} className={`bn-item${activo(href) ? ' active' : ''}`}><Icon size={21} /><span>{texto}</span></Link>
        ))}
      </nav>
    </div>
  );
}
