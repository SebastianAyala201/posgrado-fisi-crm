'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bot, BrainCircuit, Gauge, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useStore } from '@/lib/store';
import { nombrePrograma } from '@/lib/domain/catalogos';
import { predecir } from '@/lib/services/ia';
import { LINEA_BASE } from '@/lib/metricas';
import { BarrasColores } from '@/components/graficos';
import { EtapaBadge, Kpi, Probabilidad, nombreCompleto } from '@/components/ui';

export default function DashboardIA() {
  const { interesados } = useStore();

  const d = useMemo(() => {
    const activos = interesados.filter((x) => x.etapa !== 'postulante' && x.etapa !== 'no_convertido')
      .map((x) => ({ x, ...predecir(x) })).sort((a, b) => b.p - a.p);
    const postulantes = interesados.filter((x) => x.etapa === 'postulante').length;
    const esperados = activos.reduce((s, a) => s + a.p, 0);
    const proyeccion = interesados.length ? Math.round(((postulantes + esperados) / interesados.length) * 100) : 0;
    const actual = interesados.length ? Math.round((postulantes / interesados.length) * 100) : 0;
    const rangos: [string, number, number, string][] = [['0–10 %', 0, 0.1, 'var(--bad)'], ['10–15 %', 0.1, 0.15, 'var(--bad)'], ['15–25 %', 0.15, 0.25, 'var(--warn)'], ['25–40 %', 0.25, 0.4, 'var(--warn)'], ['40–100 %', 0.4, 1.01, 'var(--ok)']];
    const hist = rangos.map(([nombre, a, b, color]) => ({ nombre, valor: activos.filter((v) => v.p >= a && v.p < b).length, color }));
    const riesgo = activos.filter((v) => v.p < 0.1).sort((a, b) => a.p - b.p);
    return { activos, esperados: Math.round(esperados), proyeccion, actual, hist, alta: activos.filter((v) => v.p >= 0.4).length, riesgo };
  }, [interesados]);

  return (
    <div className="pagina">
      <header className="pag-head">
        <div><p className="eyebrow"><Sparkles size={14} /> Inteligencia artificial</p><h1>Dashboard IA</h1></div>
        <p className="muted">Analítica predictiva de postulación</p>
      </header>

      <div className="kpis">
        <Kpi icono={<Gauge size={16} />} etiqueta="En proceso" valor={d.activos.length} detalle="interesados activos" />
        <Kpi icono={<Target size={16} />} etiqueta="Postulantes esperados" valor={`+${d.esperados}`} detalle="según la probabilidad de cada uno" />
        <Kpi icono={<TrendingUp size={16} />} etiqueta="Conversión proyectada" valor={`${d.proyeccion} %`} detalle={`hoy ${d.actual} % · línea base ${LINEA_BASE} %`} acento />
        <Kpi icono={<AlertTriangle size={16} />} etiqueta="En riesgo" valor={d.riesgo.length} detalle="probabilidad menor a 10 %" />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>Distribución de probabilidad</h2>
          <p className="muted small sub">Interesados activos según su probabilidad de postular</p>
          <BarrasColores datos={d.hist} />
        </section>
        <section className="card">
          <h2><BrainCircuit size={18} /> Cómo funciona el modelo</h2>
          <dl className="modelo">
            <dt>Entrada</dt><dd>Etapa, número de contactos, horas hasta la primera respuesta, días sin contacto y canal de origen.</dd>
            <dt>Salida</dt><dd>Probabilidad de que el interesado postule (0 a 100 %) y los factores que la explican.</dd>
            <dt>Uso</dt><dd>Ordenar a quién contactar primero y rescatar a los interesados en riesgo.</dd>
            <dt>Semana 15</dt><dd>Se reemplaza por un modelo entrenado con los datos 2025 (scikit-learn), con métricas y el endpoint <code>POST /api/v1/ia/predict/</code>.</dd>
          </dl>
        </section>
      </div>

      <div className="grid-2 grid-2-asim">
        <section className="card sin-pad">
          <div className="card-head pad"><h2>Contactar primero</h2><span className="muted small">Mayor probabilidad</span></div>
          <table className="tabla tabla-click">
            <thead><tr><th>#</th><th>Interesado</th><th>Etapa</th><th>Probabilidad</th></tr></thead>
            <tbody>
              {d.activos.slice(0, 7).map((v, i) => (
                <tr key={v.x.id}>
                  <td data-l="#">{i + 1}</td>
                  <td data-l="Interesado"><Link href={`/portal/interesado/?id=${v.x.id}`} className="link-fila"><b>{nombreCompleto(v.x)}</b><br /><span className="muted small">{nombrePrograma(v.x.programa)}</span></Link></td>
                  <td data-l="Etapa"><EtapaBadge id={v.x.etapa} /></td>
                  <td data-l="Prob."><Probabilidad p={v.p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2><AlertTriangle size={18} /> Rescatar</h2>
          <p className="muted small sub">Probabilidad baja y el factor que más pesa</p>
          <ul className="riesgo">
            {d.riesgo.slice(0, 5).map((v) => {
              const peor = [...v.factores].sort((a, b) => a.efecto - b.efecto)[0];
              return (
                <li key={v.x.id}>
                  <Link href={`/portal/interesado/?id=${v.x.id}`}><b>{nombreCompleto(v.x)}</b></Link>
                  <Probabilidad p={v.p} compacto />
                  <span className="muted small">{peor && peor.efecto < 0 ? peor.texto : 'Aún sin contacto'}</span>
                </li>
              );
            })}
            {!d.riesgo.length && <p className="muted">No hay interesados en riesgo.</p>}
          </ul>
        </section>
      </div>

      <section className="card card-ia asistente-card">
        <Bot size={34} />
        <div>
          <h2>Asistente de admisión (chatbot)</h2>
          <p>El sitio público tiene un asistente que responde preguntas frecuentes sobre programas, costos, requisitos y fechas, y lleva al formulario. Hoy responde con reglas; en la semana 15 se conecta a un LLM. Aprovecha el chatbot que la UPG ya tiene sin uso.</p>
        </div>
        <Link href="/" className="btn btn-sec">Probar el asistente</Link>
      </section>
    </div>
  );
}
