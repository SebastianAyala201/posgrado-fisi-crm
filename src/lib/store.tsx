'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { repositorio } from './services/repositorio';
import type { EtapaId, Interesado, NuevoRegistro, Sesion, TipoInteraccion } from './domain/tipos';

interface Store {
  interesados: Interesado[];
  cargando: boolean;
  sesion: Sesion | null;
  sesionLista: boolean;
  error: string | null;
  login: (u: string, c: string) => Promise<void>;
  logout: () => void;
  registrar: (d: NuevoRegistro) => Promise<{ id: string }>;
  cambiarEtapa: (id: string, e: EtapaId, motivo?: string) => Promise<void>;
  agregarInteraccion: (id: string, t: TipoInteraccion, texto: string) => Promise<void>;
  programarRecordatorio: (id: string, f: string | null) => Promise<void>;
  reiniciarDemo: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);
const CLAVE_SESION = 'crm-sesion';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [interesados, setInteresados] = useState<Interesado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [sesionLista, setSesionLista] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    try { setInteresados(await repositorio.listar()); setError(null); }
    catch (e) { setError((e as Error).message); }
  }, []);

  useEffect(() => {
    try { const s = sessionStorage.getItem(CLAVE_SESION); if (s) setSesion(JSON.parse(s)); } catch { /* sin sesión */ }
    setSesionLista(true);
    refrescar().finally(() => setCargando(false));
  }, [refrescar]);

  const envolver = <A extends unknown[]>(f: (...a: A) => Promise<unknown>) => async (...a: A) => { await f(...a); await refrescar(); };

  const value: Store = {
    interesados, cargando, sesion, sesionLista, error,
    login: async (u, c) => {
      const s = await repositorio.login(u, c);
      setSesion(s);
      try { sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s)); } catch { /* */ }
    },
    logout: () => { setSesion(null); try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* */ } },
    registrar: async (d) => { const r = await repositorio.registrar(d); await refrescar(); return r; },
    cambiarEtapa: envolver((id: string, e: EtapaId, m?: string) => repositorio.cambiarEtapa(id, e, m)),
    agregarInteraccion: envolver((id: string, t: TipoInteraccion, x: string) => repositorio.agregarInteraccion(id, t, x)),
    programarRecordatorio: envolver((id: string, f: string | null) => repositorio.programarRecordatorio(id, f)),
    reiniciarDemo: async () => { repositorio.reiniciar?.(); await refrescar(); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de StoreProvider');
  return s;
}
