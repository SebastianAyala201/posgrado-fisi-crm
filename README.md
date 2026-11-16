# CRM de Admisión · Posgrado FISI — Frontend

Frontend del CRM de admisión y seguimiento de interesados de la Unidad de Posgrado FISI – UNMSM.
Grupo 9 · Tendencias de Arquitectura de Software · Semana 13 (Frontend).

## Qué incluye

| Ruta | Pantalla | Usuario |
|---|---|---|
| `/` | Sitio público: programas, proceso, formulario único, preguntas frecuentes y asistente (chatbot) | Interesado |
| `/privacidad/` | Uso de datos personales (Ley N.º 29733) | Interesado |
| `/portal/login/` | Inicio de sesión por rol | Personal UPG / Director |
| `/portal/` | Dashboard: KPIs, embudo, registros por semana, canales, motivos de no conversión, conversión por programa, seguimientos | Director / Personal |
| `/portal/interesados/` | Bandeja unificada: búsqueda, filtros, alta manual (WhatsApp), copiar CSV | Personal UPG |
| `/portal/interesado/?id=` | Ficha: mover en el embudo, recordatorio, predicción IA con factores, bitácora e historial de etapas | Personal UPG |
| `/portal/embudo/` | Kanban con la máquina de estados (arrastrar o seleccionar) y motivo obligatorio | Personal UPG |
| `/portal/ia/` | Dashboard IA: conversión proyectada, distribución de probabilidad, a quién contactar y a quién rescatar | Director |

Responsive (web y móvil), modo oscuro automático e instalable como app (PWA) en celular y escritorio.

Cuentas de demostración (contraseña `demo123`): `personal@upg` y `director@upg`.

## Stack

Next.js 15 (App Router, exportación estática) · React 19 · TypeScript · Recharts · Lucide.

## Arquitectura del frontend

```
src/
  app/                    rutas (sitio público y portal)
  components/             componentes reutilizables (UI, gráficos, modales, asistente)
  lib/
    domain/               tipos, catálogos y máquina de estados del embudo (igual que change_stage() del backend)
    services/
      repositorio.ts      patrón Repository: RepositorioLocal (demo) y RepositorioHttp (Django REST)
      ia.ts               predicción y asistente (se reemplazan por /predict y un LLM en la semana 15)
    metricas.ts           indicadores (los entregará la app `reporting` del backend)
    store.tsx             estado global (Context API)
```

Las pantallas solo conocen la interfaz `Repositorio`. Para conectar el backend (semana 14) basta definir
`NEXT_PUBLIC_API_URL` (por ejemplo `https://api-xxxx.a.run.app`): el frontend pasa a usar `/api/v1/` con JWT.

## Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera la carpeta out/
```

## Desplegar en Vercel

1. Crear un repositorio en GitHub y subir esta carpeta (sin `node_modules`).
2. En vercel.com → **Add New → Project** → importar el repositorio.
3. Vercel detecta Next.js solo → **Deploy**.
4. Semana 14: en **Settings → Environment Variables** agregar `NEXT_PUBLIC_API_URL` y volver a desplegar.
