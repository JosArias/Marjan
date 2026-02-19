const cm = { blue:'bg-blue-50 text-blue-600', green:'bg-green-50 text-green-600', red:'bg-red-50 text-red-600', amber:'bg-amber-50 text-amber-600', purple:'bg-purple-50 text-purple-600' }
export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {Icon && <div className={`p-2.5 rounded-lg flex-shrink-0 ${cm[color]}`}><Icon className="w-5 h-5" /></div>}
      </div>
    </div>
  )
}
