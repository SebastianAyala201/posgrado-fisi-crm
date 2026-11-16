'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--text)', fontSize: 13 }, cursor: { fill: 'var(--surface-2)' } };

export function BarrasVerticales({ datos, clave = 'valor', color = 'var(--accent)', alto = 240, etiqueta = 'Interesados' }: { datos: Record<string, unknown>[]; clave?: string; color?: string; alto?: number; etiqueta?: string }) {
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="nombre" interval={0} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
        <YAxis hide />
        <Tooltip {...tip} />
        <Bar dataKey={clave} name={etiqueta} fill={color} radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
          <LabelList dataKey={clave} position="top" style={{ fill: 'var(--text)', fontSize: 13, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarrasColores({ datos, alto = 240 }: { datos: { nombre: string; valor: number; color: string }[]; alto?: number }) {
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="nombre" interval={0} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
        <YAxis hide />
        <Tooltip {...tip} />
        <Bar dataKey="valor" name="Interesados" radius={[6, 6, 0, 0]} maxBarSize={64} isAnimationActive={false}>
          {datos.map((d) => <Cell key={d.nombre} fill={d.color} />)}
          <LabelList dataKey="valor" position="top" style={{ fill: 'var(--text)', fontSize: 13, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Tendencia({ datos, alto = 220 }: { datos: { nombre: string; registros: number }[]; alto?: number }) {
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <AreaChart data={datos} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <Tooltip {...tip} cursor={{ stroke: 'var(--line)' }} />
        <Area type="monotone" dataKey="registros" name="Registros" stroke="var(--accent)" strokeWidth={2.5} fill="url(#gradTend)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
