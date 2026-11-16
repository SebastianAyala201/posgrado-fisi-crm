'use client';
import { useEffect } from 'react';

// Registra el service worker para que el portal se pueda instalar como app (PWA)
// en celular y escritorio. Si el navegador no lo permite, no pasa nada.
export default function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
