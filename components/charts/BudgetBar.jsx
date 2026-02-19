import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../lib/constants'
export default function BudgetBar({ projects }) {
  const data = projects.slice(0, 8).map(p => ({
    name: p.name.length > 14 ? p.name.slice(0,12)+'…' : p.name,
    Budget: p.budget_total, Actual: p.budget_actual,
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={v => formatCurrency(v)} />
        <Legend />
        <Bar dataKey="Budget" fill="#93c5fd" radius={[4,4,0,0]} />
        <Bar dataKey="Actual" fill="#3b82f6" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
