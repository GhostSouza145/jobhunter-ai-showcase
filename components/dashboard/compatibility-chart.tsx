'use client';

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface CompatibilityDistribution {
  high: number;
  good: number;
  low: number;
}

const TIER_COLORS = {
  high: '#22c55e',
  good: '#6366f1',
  low: '#eab308',
};

export function CompatibilityChart({ distribution }: { distribution: CompatibilityDistribution }) {
  const data = [
    { key: 'high', label: 'Alta (85–100%)', value: distribution.high },
    { key: 'good', label: 'Boa (70–84%)', value: distribution.good },
    { key: 'low', label: 'Baixa (<70%)', value: distribution.low },
  ];

  const total = distribution.high + distribution.good + distribution.low;

  if (total === 0) {
    return <p className="text-sm text-muted">Ainda não há vagas suficientes para gerar o gráfico.</p>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
          <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fill: '#8a8f9c', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#181b23',
              border: '1px solid #242833',
              borderRadius: 12,
              fontSize: 12,
              color: '#e6e7eb',
            }}
            formatter={(value: number) => [`${value} vaga${value === 1 ? '' : 's'}`, '']}
            labelFormatter={() => ''}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={TIER_COLORS[entry.key as keyof typeof TIER_COLORS]} />
            ))}
            <LabelList dataKey="value" position="right" fill="#e6e7eb" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
