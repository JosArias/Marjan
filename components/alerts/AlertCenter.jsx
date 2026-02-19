import { useEffect, useRef } from 'react'
import { CheckCheck, AlertTriangle, Info, X } from 'lucide-react'
import { useAlerts } from '../../hooks/useAlerts'

const cfg = {
  StatusRed:        { Icon: AlertTriangle, cls: 'text-red-600 bg-red-50 border-red-100' },
  DecisionRequired: { Icon: Info,          cls: 'text-amber-600 bg-amber-50 border-amber-100' },
  BudgetThreshold:  { Icon: AlertTriangle, cls: 'text-orange-600 bg-orange-50 border-orange-100' },
  TimelineVariance: { Icon: Info,          cls: 'text-blue-600 bg-blue-50 border-blue-100' },
}

export default function AlertCenter({ onClose }) {
  const { alerts, markRead, markAllRead } = useAlerts()
  const ref = useRef()
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Alerts</h3>
        <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No alerts</p>}
        {alerts.map(a => {
          const { Icon, cls } = cfg[a.alert_type] ?? cfg.TimelineVariance
          return (
            <div key={a.id} className={`flex gap-3 p-3 rounded-lg border transition-opacity ${cls} ${a.is_read ? 'opacity-50' : ''}`}>
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{a.project?.name}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{a.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(a.sent_at).toLocaleString()}</p>
              </div>
              {!a.is_read && (
                <button onClick={() => markRead(a.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
