"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PieChartPremium({ data }) {
  const chartData = (data && data.length > 0) ? data : [
    { name: 'Aprovados', value: 400, color: '#10B981' },
    { name: 'Pendentes', value: 300, color: '#F59E0B' },
    { name: 'Cancelados', value: 100, color: '#EF4444' },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ fontWeight: 'bold' }}
            formatter={(value) => [`${value} Vendas`]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '14px', color: '#888' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
