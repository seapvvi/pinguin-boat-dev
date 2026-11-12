'use client';

// Kept out of the page bundle: recharts only loads once this card renders.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsChartProps {
  data: { time: string; cpu: number; ram: number }[];
  axis: { stroke: string; tick: { fontSize: number; fill: string } };
  tooltip: React.CSSProperties;
}

export default function StatsChart({ data, axis, tooltip }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--line-soft)" strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="time" stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={{ stroke: 'var(--line-soft)' }} minTickGap={28} />
        <YAxis stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <Tooltip contentStyle={tooltip} formatter={(v) => [`${typeof v === 'number' ? v.toFixed(1) : v}%`, '']} labelFormatter={(l) => `${l}`} />
        <Line type="monotone" dataKey="cpu" name="cpu" stroke="var(--ink)" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="ram" name="ram" stroke="var(--ink-dim)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
