"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BarChartPremium({ data, dataKey = "value", name = "Vendas" }) {
  const chartData = (data && data.length > 0) ? data : [
    { name: 'Curso Web', value: 120 },
    { name: 'Mentoria Vip', value: 45 },
    { name: 'E-book Python', value: 300 },
    { name: 'Evento Ao Vivo', value: 80 },
  ];

  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#222222' }}
            contentStyle={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }}
            itemStyle={{ color: '#0E7C86', fontWeight: 'bold' }}
            formatter={(value) => [`${value}`, name]}
          />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#0E7C86" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
