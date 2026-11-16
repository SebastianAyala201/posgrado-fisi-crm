'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2, ChevronDown, Code2, Database, GraduationCap, Lock, ShieldCheck, Telescope, Workflow, Network } from 'lucide-react';
import Logo from '@/components/Logo';
import Asistente from '@/components/Asistente';
import Formulario from '@/components/Formulario';
import { PROGRAMAS } from '@/lib/domain/catalogos';

const ICONOS: Record<string, typeof Code2> = { mgti: Workflow, msw: Code2, mia: BrainCircuit, madi: Database, mcs: ShieldCheck, dis: Network, ddt: Telescope };

const FAQ = [
  { p: '¿Solicitar información me compromete a postular?', r: 'No. Es solo el primer paso: un asesor te envía el brochure del programa y resuelve tus dudas.' },
  { p: '¿Qué requisitos necesito?', r: 'Dependen del programa. Para el doctorado se requiere el grado de maestro o magíster. El asesor te envía la lista completa.' },
  { p: '¿Cómo es el proceso de admisión?', r: 'Tiene tres etapas: inscripción, evaluación y entrevista. Te avisamos las fechas del próximo proceso.' },
  { p: '¿Qué hacen con mis datos?', r: 'Solo los usamos para atender tu solicitud de admisión, según la Ley N.º 29733 de Protección de Datos Personales.' },
];

export default function Inicio() {
  const [filtro, setFiltro] = useState<'Todos' | 'Maestría' | 'Doctorado'>('Todos');
  const [elegido, setElegido] = useState('');
  const lista = useMemo(() => PROGRAMAS.filter((p) => filtro === 'Todos' || p.grado === filtro), [filtro]);

  const meInteresa = (id: string) => {
    setElegido(id);
    document.getElementById('solicitar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sitio">
      <a href="#contenido" className="saltar">Saltar al contenido</a>
      <header className="sitio-header">
        <div className="contenedor header-fila">
          <Link href="/" aria-label="Inicio"><Logo /></Link>
          <nav className="sitio-nav" aria-label="Principal">
            <a href="#programas">Programas</a>
            <a href="#proceso">Proceso</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <div className="header-acciones">
            <Link href="/portal/login/" className="btn btn-ghost btn-sm"><Lock size={15} /> Personal</Link>
            <a href="#solicitar" className="btn btn-pri btn-sm ocultar-movil">Solicitar información</a>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="hero">
          <div className="contenedor hero-grid">
            <div>
              <p className="eyebrow">Unidad de Posgrado · Facultad de Ingeniería de Sistemas e Informática</p>
              <h1>Da el siguiente paso en tu formación profesional</h1>
              <p className="lead">Maestrías y doctorados con enfoque en inteligencia artificial y tecnologías emergentes. Déjanos tus datos y un asesor te acompaña hasta tu postulación.</p>
              <div className="hero-cta">
                <a href="#solicitar" className="btn btn-pri btn-lg">Solicitar información <ArrowRight size={18} /></a>
                <a href="#programas" className="btn btn-ghost btn-lg">Ver programas</a>
              </div>
              <ul className="hero-puntos">
                <li><CheckCircle2 size={18} /> Sin compromiso de postular</li>
                <li><CheckCircle2 size={18} /> Atención personalizada</li>
              </ul>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="hv-card hv-1"><GraduationCap size={22} /><div><b>5</b><span>maestrías</span></div></div>
              <div className="hv-card hv-2"><Telescope size={22} /><div><b>2</b><span>doctorados</span></div></div>
              <div className="hv-card hv-3"><BrainCircuit size={22} /><div><b>IA</b><span>en el centro de la oferta</span></div></div>
              <svg className="hv-red" viewBox="0 0 400 400">
                {[[60, 80], [200, 40], [330, 110], [110, 220], [260, 230], [360, 300], [150, 350], [40, 320]].map(([x, y], i, a) =>
                  a.slice(i + 1).filter((_, j) => (i + j) % 3 !== 1).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} />))}
                {[[60, 80], [200, 40], [330, 110], [110, 220], [260, 230], [360, 300], [150, 350], [40, 320]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 9 : 6} />)}
              </svg>
            </div>
          </div>
        </section>

        <section id="programas" className="seccion">
          <div className="contenedor">
            <div className="seccion-head">
              <div><p className="eyebrow">Oferta académica</p><h2>Nuestros programas</h2></div>
              <div className="tabs" role="tablist">
                {(['Todos', 'Maestría', 'Doctorado'] as const).map((f) => (
                  <button key={f} role="tab" aria-selected={filtro === f} className={`tab${filtro === f ? ' on' : ''}`} onClick={() => setFiltro(f)}>
                    {f === 'Todos' ? 'Todos' : f === 'Maestría' ? 'Maestrías' : 'Doctorados'}
                  </button>
                ))}
              </div>
            </div>
            <div className="programas">
              {lista.map((p) => {
                const Icono = ICONOS[p.id] ?? GraduationCap;
                return (
                  <article key={p.id} className={`programa${p.grado === 'Doctorado' ? ' doctorado' : ''}`}>
                    <div className="programa-icono"><Icono size={22} /></div>
                    <p className="programa-grado">{p.grado}</p>
                    <h3>{p.nombre.replace(/^(Maestría|Doctorado) en /, '')}</h3>
                    <p className="muted">{p.descripcion}</p>
                    <button className="btn btn-sec btn-sm" onClick={() => meInteresa(p.id)}>Me interesa <ArrowRight size={15} /></button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="proceso" className="seccion seccion-alt">
          <div className="contenedor">
            <p className="eyebrow">Cómo funciona</p>
            <h2>De tu consulta a tu postulación</h2>
            <ol className="pasos">
              <li><span>1</span><h3>Solicitas información</h3><p>Llenas el formulario en un minuto, desde tu celular o computadora.</p></li>
              <li><span>2</span><h3>Te contacta un asesor</h3><p>Recibes el brochure y resuelves tus dudas por el medio que prefieras.</p></li>
              <li><span>3</span><h3>Te inscribes</h3><p>Te acompañamos con los requisitos del programa que elegiste.</p></li>
              <li><span>4</span><h3>Evaluación y entrevista</h3><p>Rindes la evaluación y la entrevista del proceso de admisión.</p></li>
            </ol>
          </div>
        </section>

        <section id="solicitar" className="seccion">
          <div className="contenedor solicitar-grid">
            <div>
              <p className="eyebrow">Solicitar información</p>
              <h2>Te respondemos personalmente</h2>
              <p className="lead">Elige el programa que te interesa y cómo prefieres que te contactemos. Si aún no lo decides, también te orientamos.</p>
              <ul className="hero-puntos vertical">
                <li><CheckCircle2 size={18} /> Brochure y malla curricular del programa</li>
                <li><CheckCircle2 size={18} /> Requisitos y fechas del proceso</li>
                <li><ShieldCheck size={18} /> Tus datos protegidos (Ley N.º 29733)</li>
              </ul>
            </div>
            <Formulario programaInicial={elegido} key={elegido} />
          </div>
        </section>

        <section id="preguntas" className="seccion seccion-alt">
          <div className="contenedor angosto">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Resolvemos tus dudas</h2>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.p}>
                  <summary>{f.p}<ChevronDown size={18} /></summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="sitio-footer">
        <div className="contenedor footer-fila">
          <Logo claro />
          <p>Unidad de Posgrado · Facultad de Ingeniería de Sistemas e Informática · UNMSM</p>
          <p className="footer-nota">Prototipo académico · Tendencias de Arquitectura de Software · Grupo 9 · <Link href="/privacidad/">Uso de datos</Link></p>
        </div>
      </footer>
      <Asistente />
    </div>
  );
}
