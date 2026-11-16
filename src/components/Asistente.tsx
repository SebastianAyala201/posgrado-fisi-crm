'use client';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';
import { responderAsistente } from '@/lib/services/ia';

const SUGERENCIAS = ['¿Qué programas ofrecen?', '¿Cuánto cuesta?', '¿Cuáles son los requisitos?', '¿Cuándo es la admisión?'];

export default function Asistente() {
  const [abierto, setAbierto] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [msgs, setMsgs] = useState([{ de: 'bot', texto: '¡Hola! Soy el asistente de admisión de Posgrado FISI. ¿En qué te ayudo?' }]);
  const [txt, setTxt] = useState('');
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, escribiendo]);

  const preguntar = (pregunta: string) => {
    if (!pregunta.trim()) return;
    setMsgs((m) => [...m, { de: 'yo', texto: pregunta }]);
    setTxt('');
    setEscribiendo(true);
    setTimeout(() => { setMsgs((m) => [...m, { de: 'bot', texto: responderAsistente(pregunta) }]); setEscribiendo(false); }, 650);
  };

  return (
    <>
      {abierto && (
        <section className="chat" aria-label="Asistente de admisión">
          <header className="chat-head">
            <div className="chat-avatar"><Sparkles size={18} /></div>
            <div><p className="chat-titulo">Asistente de admisión</p><p className="chat-sub">Responde al instante · IA</p></div>
            <button className="icon-btn icon-claro" onClick={() => setAbierto(false)} aria-label="Cerrar asistente"><X size={18} /></button>
          </header>
          <div className="chat-body">
            {msgs.map((m, i) => <p key={i} className={`burbuja ${m.de}`}>{m.texto}</p>)}
            {escribiendo && <p className="burbuja bot escribiendo"><span /><span /><span /></p>}
            {msgs.length === 1 && (
              <div className="sugerencias">{SUGERENCIAS.map((s) => <button key={s} className="chip" onClick={() => preguntar(s)}>{s}</button>)}</div>
            )}
            <div ref={fin} />
          </div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); preguntar(txt); }}>
            <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escribe tu pregunta…" aria-label="Pregunta" />
            <button className="icon-btn" aria-label="Enviar" disabled={!txt.trim()}><Send size={18} /></button>
          </form>
        </section>
      )}
      <button className="fab" onClick={() => setAbierto(!abierto)} aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}>
        {abierto ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
}
