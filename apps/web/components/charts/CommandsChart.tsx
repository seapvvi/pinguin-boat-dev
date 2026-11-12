'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommandsChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
        <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
