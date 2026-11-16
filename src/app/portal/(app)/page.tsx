'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { AlarmClock, ArrowRight, BellRing, Clock, Target, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { metricas, LINEA_BASE } from '@/lib/metricas';
import { nombrePrograma } from '@/lib/domain/catalogos';
import { BarrasVerticales, Tendencia } from '@/components/graficos';
import { EtapaBadge, Kpi, fecha, nombreCompleto } from '@/components/ui';

export default function Dashboard() {
  const { interesados, sesion } = useStore();
  const m = useMemo(() => metricas(interesados), [interesados]);
  const maxEmbudo = m.embudo[0]?.valor || 1;
  const dif = m.conversion - LINEA_BASE;

  return (
    <div className="pagina">
      <header className="pag-head">
        <div>
          <p className="eyebrow">Hola, {sesion?.nombre}</p>
          <h1>Dashboard de admisión</h1>
        </div>
        <Link href="/portal/interesados/?nuevo=1" className="btn btn-pri"><UserPlus size={17} /> Registrar interesado</Link>
      </header>

      <div className="kpis">
        <Kpi icono={<Users size={16} />} etiqueta="Interesados" valor={m.total} detalle="registrados en el proceso" />
        <Kpi icono={<Target size={16} />} etiqueta="Postulantes" valor={m.postulantes} detalle={`se inscribieron · ${m.admitidos} admitidos`} />
        <Kpi icono={<TrendingUp size={16} />} etiqueta="Conversión" valor={`${m.conversion} %`} detalle={`${dif >= 0 ? '+' : ''}${dif} pts frente a la línea base (${LINEA_BASE} %)`} acento />
        <Kpi icono={<Clock size={16} />} etiqueta="Primera respuesta" valor={`${m.promResp} h`} detalle="tiempo promedio" />
      </div>

      {m.sinAtender.length > 0 && (
        <Link href="/portal/embudo/" className="alerta">
          <AlarmClock size={20} />
          <span><b>{m.sinAtender.length} interesado{m.sinAtender.length > 1 ? 's' : ''} sin atender</b> por más de 48 horas</span>
          <ArrowRight size={18} />
        </Link>
      )}

      <div className="grid-2">
        <section className="card">
          <h2>Embudo de conversión</h2>
          <p className="muted small sub">Cuántos interesados llegaron a cada etapa</p>
          <ol className="embudo">
            {m.embudo.map((e, i) => (
              <li key={e.id}>
                <span className="embudo-nombre">{e.nombre}</span>
                <span className="embudo-barra"><span style={{ width: `${(e.valor / maxEmbudo) * 100}%`, opacity: 1 - i * 0.13 }} /></span>
                <b>{e.valor}</b>
                <span className="muted small embudo-pct">{Math.round((e.valor / maxEmbudo) * 100)} %</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="card">
          <h2>Registros por semana</h2>
          <p className="muted small sub">Interesados nuevos en las últimas 10 semanas</p>
          <Tendencia datos={m.semanas} />
        </section>
        <section className="card">
          <h2>Interesados por canal</h2>
          <p className="muted small sub">De dónde vienen los interesados</p>
          <BarrasVerticales datos={m.canales} />
        </section>
        <section className="card">
          <h2>Motivos de no conversión</h2>
          <p className="muted small sub">Un dato que antes no se registraba</p>
          {m.motivos.length ? (
            <ul className="barras">
              {m.motivos.map((x) => (
                <li key={x.nombre}><span>{x.nombre}</span><span className="barra"><span style={{ width: `${(x.valor / m.motivos[0].valor) * 100}%` }} /></span><b>{x.valor}</b></li>
              ))}
            </ul>
          ) : <p className="muted">Aún no hay interesados no convertidos.</p>}
        </section>
      </div>

      <div className="grid-2 grid-2-asim">
        <section className="card sin-pad">
          <div className="card-head pad"><h2>Conversión por programa</h2></div>
          <table className="tabla">
            <thead><tr><th>Programa</th><th className="num">Interesados</th><th className="num">Postulantes</th><th className="num">Conversión</th></tr></thead>
            <tbody>{m.programas.map((p) => (
              <tr key={p.id}><td data-l="Programa"><b>{p.nombre}</b><br /><span className="muted small">{p.grado}</span></td><td data-l="Interesados" className="num">{p.total}</td><td data-l="Postulantes" className="num">{p.postulantes}</td><td data-l="Conversión" className="num">{p.conv} %</td></tr>
            ))}</tbody>
          </table>
        </section>
        <section className="card">
          <div className="card-head"><h2><BellRing size={18} /> Seguimientos próximos</h2><Link href="/portal/embudo/" className="link">Embudo <ArrowRight size={15} /></Link></div>
          {m.pendientes.length ? (
            <ul className="lista-pend">
              {m.pendientes.slice(0, 6).map((x) => (
                <li key={x.id}>
                  <Link href={`/portal/interesado/?id=${x.id}`}><b>{nombreCompleto(x)}</b><span className="muted small">{nombrePrograma(x.programa)}</span></Link>
                  <EtapaBadge id={x.etapa} />
                  <span className={`small fecha-rec${new Date(x.recordatorio!) < new Date() ? ' vencido' : ''}`}>{fecha(x.recordatorio)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No hay seguimientos para los próximos días.</p>}
        </section>
      </div>
    </div>
  );
}
