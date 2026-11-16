// Patrón Repository: las pantallas dependen de esta interfaz, no de dónde vienen los datos.
// - RepositorioLocal: modo demo (semana 13), datos de prueba en el navegador.
// - RepositorioHttp: API de Django REST (semana 14), se activa con NEXT_PUBLIC_API_URL.
import { generarInteresados } from '../data/mock';
import { VERSION_CONSENTIMIENTO } from '../domain/catalogos';
import { puedeMover, requiereMotivo } from '../domain/embudo';
import type { EtapaId, Interesado, Interaccion, NuevoRegistro, Sesion, TipoInteraccion } from '../domain/tipos';

export interface Repositorio {
  listar(): Promise<Interesado[]>;
  registrar(datos: NuevoRegistro): Promise<{ id: string }>;
  cambiarEtapa(id: string, etapa: EtapaId, motivo?: string): Promise<Interesado>;
  agregarInteraccion(id: string, tipo: TipoInteraccion, texto: string): Promise<Interesado>;
  programarRecordatorio(id: string, fecha: string | null): Promise<Interesado>;
  login(usuario: string, clave: string): Promise<Sesion>;
}

const CLAVE = 'crm-upg-v4';
const espera = (ms = 120) => new Promise((r) => setTimeout(r, ms));

class RepositorioLocal implements Repositorio {
  private cache: Interesado[] | null = null;

  private datos(): Interesado[] {
    if (this.cache) return this.cache;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CLAVE) : null;
      this.cache = raw ? JSON.parse(raw) : generarInteresados();
    } catch {
      this.cache = generarInteresados();
    }
    return this.cache!;
  }

  private guardar(lista: Interesado[]) {
    this.cache = lista;
    try { window.localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
  }

  private actualizar(id: string, f: (x: Interesado) => Interesado) {
    const lista = this.datos().map((x) => (x.id === id ? f(x) : x));
    this.guardar(lista);
    return lista.find((x) => x.id === id)!;
  }

  async listar() { await espera(); return [...this.datos()]; }

  async registrar(d: NuevoRegistro) {
    await espera(400);
    const lista = this.datos();
    // Deduplicación por correo o teléfono (como register_lead() del backend)
    const existente = lista.find((x) => x.correo.toLowerCase() === d.correo.toLowerCase() || x.telefono === d.telefono);
    if (existente) return { id: existente.id };
    const ahora = new Date().toISOString();
    const nuevo: Interesado = {
      ...d,
      id: String(Math.max(1000, ...lista.map((x) => +x.id)) + 1),
      etapa: 'nuevo', motivo: null, creado: ahora, ultimoContacto: null, recordatorio: null,
      horasPrimeraRespuesta: null, interacciones: [],
      historial: [{ de: null, a: 'nuevo', fecha: ahora, autor: 'Formulario web' }],
      consentimiento: { fecha: ahora, version: VERSION_CONSENTIMIENTO },
    };
    this.guardar([nuevo, ...lista]);
    return { id: nuevo.id };
  }

  async cambiarEtapa(id: string, etapa: EtapaId, motivo?: string) {
    await espera(80);
    const x = this.datos().find((i) => i.id === id);
    if (!x) throw new Error('Interesado no encontrado');
    if (!puedeMover(x.etapa, etapa)) throw new Error('Transición no permitida');
    if (requiereMotivo(etapa) && !motivo) throw new Error('Se requiere un motivo');
    return this.actualizar(id, (i) => ({
      ...i,
      etapa,
      motivo: etapa === 'no_convertido' ? motivo! : null,
      recordatorio: etapa === 'postulante' || etapa === 'no_convertido' ? null : i.recordatorio,
      historial: [{ de: i.etapa, a: etapa, fecha: new Date().toISOString(), autor: 'Mesa de admisión', motivo }, ...i.historial],
    }));
  }

  async agregarInteraccion(id: string, tipo: TipoInteraccion, texto: string) {
    await espera(80);
    const nueva: Interaccion = { id: `${id}-${Date.now()}`, tipo, texto, fecha: new Date().toISOString(), autor: 'Mesa de admisión' };
    return this.actualizar(id, (i) => ({
      ...i,
      interacciones: [nueva, ...i.interacciones],
      ultimoContacto: nueva.fecha,
      horasPrimeraRespuesta: i.horasPrimeraRespuesta ?? Math.max(1, Math.round((Date.now() - new Date(i.creado).getTime()) / 3_600_000)),
    }));
  }

  async programarRecordatorio(id: string, fecha: string | null) {
    await espera(60);
    return this.actualizar(id, (i) => ({ ...i, recordatorio: fecha }));
  }

  async login(usuario: string, clave: string): Promise<Sesion> {
    await espera(350);
    const cuentas: Record<string, Omit<Sesion, 'token'>> = {
      'personal@upg': { nombre: 'Mesa de admisión', rol: 'personal' },
      'director@upg': { nombre: 'Dirección de Posgrado', rol: 'director' },
    };
    if (cuentas[usuario] && clave === 'demo123') return { token: 'demo', ...cuentas[usuario] };
    throw new Error('Usuario o contraseña incorrectos');
  }

  reiniciar() { this.guardar(generarInteresados()); }
}

class RepositorioHttp implements Repositorio {
  constructor(private base: string) {}
  private token() { try { return JSON.parse(sessionStorage.getItem('crm-sesion') || '{}').token; } catch { return undefined; } }
  private async req<T>(ruta: string, init: RequestInit = {}): Promise<T> {
    const r = await fetch(`${this.base}/api/v1${ruta}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(this.token() ? { Authorization: `Bearer ${this.token()}` } : {}), ...init.headers },
    });
    if (!r.ok) throw new Error((await r.json().catch(() => null))?.error?.message || `Error ${r.status}`);
    return r.json();
  }
  listar() { return this.req<Interesado[]>('/leads/'); }
  registrar(d: NuevoRegistro) { return this.req<{ id: string }>('/registrations/', { method: 'POST', body: JSON.stringify(d) }); }
  cambiarEtapa(id: string, etapa: EtapaId, motivo?: string) { return this.req<Interesado>(`/leads/${id}/stage/`, { method: 'POST', body: JSON.stringify({ stage: etapa, loss_reason: motivo }) }); }
  agregarInteraccion(id: string, tipo: TipoInteraccion, texto: string) { return this.req<Interesado>(`/leads/${id}/notes/`, { method: 'POST', body: JSON.stringify({ kind: tipo, body: texto }) }); }
  programarRecordatorio(id: string, fecha: string | null) { return this.req<Interesado>(`/leads/${id}/`, { method: 'PATCH', body: JSON.stringify({ follow_up_at: fecha }) }); }
  async login(usuario: string, clave: string) {
    const t = await this.req<{ access: string; name: string; role: 'personal' | 'director' }>('/auth/token/', { method: 'POST', body: JSON.stringify({ username: usuario, password: clave }) });
    return { token: t.access, nombre: t.name, rol: t.role };
  }
}

const API = process.env.NEXT_PUBLIC_API_URL;
export const MODO_DEMO = !API;
export const repositorio: Repositorio & { reiniciar?: () => void } = API ? new RepositorioHttp(API) : new RepositorioLocal();
