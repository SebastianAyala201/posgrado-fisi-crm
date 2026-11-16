import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export const metadata = { title: 'Uso de datos · Posgrado FISI' };

export default function Privacidad() {
  return (
    <div className="sitio">
      <header className="sitio-header"><div className="contenedor header-fila"><Link href="/"><Logo /></Link></div></header>
      <main className="seccion">
        <article className="contenedor angosto texto-legal">
          <Link href="/" className="link"><ArrowLeft size={16} /> Volver</Link>
          <h1>Uso de tus datos personales</h1>
          <p>Los datos que registras en el formulario (nombres, correo, celular, programa de interés y medio de contacto) se usan solo para atender tu solicitud de información y acompañarte en el proceso de admisión de la Unidad de Posgrado.</p>
          <h2>Base legal</h2>
          <p>El tratamiento se realiza con tu consentimiento, conforme a la Ley N.º 29733, Ley de Protección de Datos Personales. Guardamos la fecha y la versión del texto que aceptaste.</p>
          <h2>Tus derechos</h2>
          <p>Puedes pedir el acceso, la rectificación, la cancelación o la oposición al uso de tus datos (derechos ARCO). Cuando pidas la cancelación, tus datos se anonimizan.</p>
          <h2>Comunicaciones</h2>
          <p>Solo te escribiremos sobre tu solicitud. Las comunicaciones promocionales requieren una autorización aparte.</p>
          <p className="muted">Texto de demostración del prototipo académico; la versión final la valida la Unidad de Posgrado.</p>
        </article>
      </main>
    </div>
  );
}
