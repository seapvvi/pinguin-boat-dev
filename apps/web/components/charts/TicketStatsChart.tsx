'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TicketStatsChart({
  data,
}: {
  data: { categoryName: string; responseMin: number; resolutionMin: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="categoryName" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-secondary)', fontSize: 12 } }} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 0, fontSize: '13px' }}
          formatter={(value, name) => [`${value} min`, name === 'responseMin' ? 'Réponse' : 'Résolution']}
        />
        <Bar dataKey="responseMin" name="Réponse" fill="#14b8a6" />
        <Bar dataKey="resolutionMin" name="Résolution" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
