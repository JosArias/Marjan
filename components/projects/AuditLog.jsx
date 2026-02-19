import { format } from 'date-fns'
export default function AuditLog({ entries }) {
  if (!entries.length) return <p className="text-sm text-gray-400">No audit entries yet.</p>
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {entries.map(e => (
        <div key={e.id} className="flex gap-3 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-2 flex-shrink-0"/>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{e.action} on {e.table_name}</span>
              <span className="text-gray-400 text-xs">{e.user_email??'System'}</span>
            </div>
            {e.changed_fields?.length>0 && (
              <p className="text-xs text-gray-400 mt-0.5">Changed: {e.changed_fields.join(', ')}</p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">{format(new Date(e.created_at),'MMM d, yyyy HH:mm')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
