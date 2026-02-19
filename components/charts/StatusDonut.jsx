import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
const COLORS = { Green: '#16a34a', Amber: '#d97706', Red: '#dc2626' }
export default function StatusDonut({ summary }) {
  const data = [
    { name: 'Green', value: Number(summary.green_count ?? 0) },
    { name: 'Amber', value: Number(summary.amber_count ?? 0) },
    { name: 'Red',   value: Number(summary.red_count ?? 0) },
  ].filter(d => d.value > 0)
  if (!data.length) return <p className="text-sm text-gray-400 text-center py-8">No data</p>
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
          {data.map(e => <Cell key={e.name} fill={COLORS[e.name]} />)}
        </Pie>
        <Tooltip formatter={v => [v, 'Projects']} />
      </PieChart>
    </ResponsiveContainer>
  )
}
