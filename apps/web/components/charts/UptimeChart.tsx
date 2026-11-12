'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UptimeChart({ data }: { data: { date: string; uptime: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="%" />
        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
        <Line type="monotone" dataKey="uptime" stroke="var(--accent)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
