'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PIE_COLORS = ['var(--accent)', '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'];

interface SourcePieChartProps {
  breakdown: { source: string; count: number }[];
  sourceLabels: Record<string, string>;
}

export default function SourcePieChart({ breakdown, sourceLabels }: SourcePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={breakdown}
          dataKey="count"
          nameKey="source"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ payload, percent }: { payload?: { source: string }; percent?: number }) => {
            const src = payload?.source ?? '';
            return `${sourceLabels[src] || src} (${((percent ?? 0) * 100).toFixed(0)}%)`;
          }}
        >
          {breakdown.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
          formatter={(value, name) => [value ?? 0, sourceLabels[String(name ?? '')] ?? String(name ?? '')]}
        />
        <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{sourceLabels[String(value)] ?? String(value)}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
