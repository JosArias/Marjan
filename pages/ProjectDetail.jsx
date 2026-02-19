import { useParams, Link } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import MilestoneTable from '../components/projects/MilestoneTable'
import RiskMatrix from '../components/projects/RiskMatrix'
import AuditLog from '../components/projects/AuditLog'
import { formatCurrency, formatPct } from '../lib/constants'
import { format } from 'date-fns'
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const { project: p, milestones, risks, auditLog, loading, error } = useProject(id)
  const { isAdmin, isPM, profile } = useAuth()

  if (loading) return <div className="flex justify-center pt-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
  if (error) return <div className="card text-red-600">Error: {error}</div>
  if (!p) return <div className="card text-gray-400">Project not found.</div>

  const canEdit = isAdmin || (isPM && p.project_manager_id === profile?.id)

  const stat = (label, value, cls) => (
    <div className="text-center p-4 border-r border-gray-100 last:border-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${cls??'text-gray-900'}`}>{value??'—'}</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-start gap-4">
        <Link to="/" className="mt-1 text-gray-300 hover:text-gray-600"><ArrowLeft className="w-5 h-5"/></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{p.name}</h2>
            <StatusBadge status={p.status} />
            {p.decision_required && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                <AlertCircle className="w-3.5 h-3.5"/>Decision Required
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            PM: {p.project_manager?.full_name??'Unassigned'} · Updated {format(new Date(p.updated_at),'MMM d, yyyy HH:mm')}
          </p>
        </div>
        {canEdit && (
          <Link to={`/projects/${id}/edit`} className="btn-secondary flex items-center gap-2 flex-shrink-0">
            <Edit className="w-4 h-4"/>Edit
          </Link>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100">
          {stat('Complete', `${p.completion_pct}%`)}
          {stat('Budget', formatCurrency(p.budget_total))}
          {stat('Actual', formatCurrency(p.budget_actual))}
          {stat('Bgt Variance', formatPct(p.budget_variance_pct), Math.abs(p.budget_variance_pct??0)>10?'text-red-600':'text-green-600')}
          {stat('IRR', p.irr!=null?`${Number(p.irr).toFixed(2)}%`:null)}
          {stat('NPV', formatCurrency(p.npv))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Start', p.start_date ? format(new Date(p.start_date),'MMM d, yyyy') : '—'],
            ['Original End', p.end_date ? format(new Date(p.end_date),'MMM d, yyyy') : '—'],
            ['Revised End', p.updated_end_date ? format(new Date(p.updated_end_date),'MMM d, yyyy') : 'On track'],
            ['Variance', p.timeline_variance_days ? `${p.timeline_variance_days>0?'+':''}${p.timeline_variance_days} days` : 'None'],
          ].map(([l,v])=>(
            <div key={l}>
              <p className="text-xs text-gray-400 font-medium">{l}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {p.executive_summary && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{p.executive_summary}</p>
        </div>
      )}

      {p.decision_required && (
        <div className="card border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4"/>Decision Required
          </h3>
          <p className="text-sm text-amber-800">{p.decision_notes??'No notes provided.'}</p>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Milestones</h3>
        <MilestoneTable milestones={milestones} />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Risk Register</h3>
        {risks.length > 0 ? <RiskMatrix risks={risks} /> : <p className="text-sm text-gray-400">No risks registered.</p>}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Audit Log</h3>
        <AuditLog entries={auditLog} />
      </div>
    </div>
  )
}
