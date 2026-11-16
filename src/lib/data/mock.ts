// Datos de prueba ficticios con semilla fija (siempre salen iguales).
// Simulan un proceso con ~25 % de conversión, como el reportado por la Dirección.
import { PROGRAMAS, CANALES, MOTIVOS_NO_CONVERSION, VERSION_CONSENTIMIENTO } from '../domain/catalogos';
import type { Canal, EtapaId, Interesado, Interaccion, MedioContacto, Transicion } from '../domain/tipos';

// Las fechas de prueba se calculan hacia atrás desde el momento de uso.
export const HOY = new Date();

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMBRES = ['Lucía', 'Carlos', 'María', 'Jorge', 'Ana', 'Luis', 'Rosa', 'Diego', 'Carmen', 'José', 'Valeria', 'Miguel', 'Patricia', 'Andrés', 'Sofía', 'Renzo', 'Gabriela', 'Fernando', 'Daniela', 'Raúl', 'Milagros', 'Óscar', 'Paola', 'Víctor', 'Katherine', 'Hugo', 'Elena', 'César'];
const APELLIDOS = ['Quispe', 'Flores', 'Huamán', 'Rojas', 'Mendoza', 'Torres', 'Castillo', 'Vargas', 'Ramírez', 'Chávez', 'Gutiérrez', 'Salazar', 'Paredes', 'Cárdenas', 'Espinoza', 'Ríos', 'Medina', 'Sánchez', 'Poma', 'Alvarado'];
const NOTAS = [
  'Se envió brochure y malla curricular.',
  'Consultó por costos y facilidades de pago.',
  'Pidió información del horario de clases.',
  'Confirmó interés; enviará documentos esta semana.',
  'No contestó la llamada; se reintentará.',
  'Preguntó por fechas del examen de admisión.',
];
const CAMINO: EtapaId[] = ['nuevo', 'contactado', 'seguimiento', 'inscrito', 'examen', 'entrevista', 'admitido'];
const dias = (d: number) => new Date(HOY.getTime() - d * 86_400_000).toISOString();
const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function generarInteresados(n = 60, semilla = 40): Interesado[] {
  const r = prng(semilla);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
  const pesos: [EtapaId, number][] = [['nuevo', 0.12], ['contactado', 0.17], ['seguimiento', 0.24], ['inscrito', 0.07], ['examen', 0.06], ['entrevista', 0.05], ['admitido', 0.07], ['no_convertido', 0.22]];
  const etapaAleatoria = (): EtapaId => {
    let x = r();
    for (const [id, p] of pesos) if ((x -= p) <= 0) return id;
    return 'nuevo';
  };

  return Array.from({ length: n }, (_, i) => {
    const nombres = pick(NOMBRES);
    const apellidos = `${pick(APELLIDOS)} ${pick(APELLIDOS)}`;
    const etapa = etapaAleatoria();
    const creado = Math.floor(r() * 75) + 1;
    const nInter = etapa === 'nuevo' ? 0 : Math.floor(r() * 5) + 1;
    const interacciones: Interaccion[] = Array.from({ length: nInter }, (_, k) => ({
      id: `${i}-${k}`,
      tipo: pick(['WhatsApp', 'Llamada', 'Correo', 'Nota interna'] as const),
      texto: pick(NOTAS),
      fecha: dias(Math.max(0, creado - 2 - k * 4)),
      autor: 'Mesa de admisión',
    })).reverse();

    // Historial de transiciones coherente con la etapa actual
    const historial: Transicion[] = [{ de: null, a: 'nuevo', fecha: dias(creado), autor: 'Formulario web' }];
    const hasta = etapa === 'no_convertido' ? Math.floor(r() * 5) : CAMINO.indexOf(etapa);
    for (let k = 1; k <= hasta; k++) historial.push({ de: CAMINO[k - 1], a: CAMINO[k], fecha: dias(Math.max(0, creado - k * 5)), autor: 'Mesa de admisión' });
    let motivo: string | null = null;
    if (etapa === 'no_convertido') {
      motivo = pick(MOTIVOS_NO_CONVERSION);
      historial.push({ de: CAMINO[hasta], a: 'no_convertido', fecha: dias(Math.max(0, creado - (hasta + 1) * 5)), autor: 'Mesa de admisión', motivo });
    }

    const canal: Canal = pick(CANALES);
    const medio: MedioContacto = pick(['whatsapp', 'whatsapp', 'correo', 'llamada'] as const);
    return {
      id: String(1001 + i),
      nombres,
      apellidos,
      correo: `${sinTildes(nombres)}.${sinTildes(apellidos.split(' ')[0])}${i}@correo.com`,
      telefono: `9${Math.floor(10_000_000 + r() * 89_999_999)}`,
      programa: pick(PROGRAMAS).id,
      canal,
      medio,
      etapa,
      motivo,
      creado: dias(creado),
      ultimoContacto: nInter ? interacciones[0].fecha : null,
      recordatorio: ['contactado', 'seguimiento', 'inscrito', 'examen', 'entrevista'].includes(etapa) && r() > 0.35 ? dias(-Math.floor(r() * 6)) : null,
      horasPrimeraRespuesta: nInter ? Math.round(1 + r() * 47) : null,
      interacciones,
      historial: historial.reverse(),
      consentimiento: { fecha: dias(creado), version: VERSION_CONSENTIMIENTO },
    };
  });
}
