import { format } from 'date-fns'
const SC = { 'Complete':'bg-green-100 text-green-700','In Progress':'bg-blue-100 text-blue-700','Delayed':'bg-red-100 text-red-700','Not Started':'bg-gray-100 text-gray-600' }
export default function MilestoneTable({ milestones }) {
  if (!milestones.length) return <p className="text-sm text-gray-400">No milestones defined.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-100">
          {['Milestone','Due','Actual','Owner','Status'].map(h=>(
            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-gray-50">
          {milestones.map(ms => {
            const late = ms.status!=='Complete' && new Date(ms.due_date)<new Date()
            return (
              <tr key={ms.id} className={late?'bg-red-50':''}>
                <td className="py-2.5 px-3 font-medium text-gray-900">{ms.name}</td>
                <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                  {ms.due_date ? format(new Date(ms.due_date),'MMM d, yyyy') : '—'}
                </td>
                <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                  {ms.actual_date ? format(new Date(ms.actual_date),'MMM d, yyyy') : '—'}
                </td>
                <td className="py-2.5 px-3 text-gray-500">{ms.owner??'—'}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SC[ms.status]}`}>{ms.status}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
