import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProjects } from '../hooks/useProjects'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatPct } from '../lib/constants'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import StatusDonut from '../components/charts/StatusDonut'
import BudgetBar from '../components/charts/BudgetBar'
import { TrendingUp, DollarSign, AlertCircle, CheckSquare, Layers, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { projects, loading } = useProjects()
  const { profile, isAdmin, isPM } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    supabase.from('portfolio_summary').select('*').single().then(({ data }) => { if (data) setSummary(data) })
  }, [projects])

  if (loading) return <div className="flex justify-center pt-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  const decisionProjects = projects.filter(p => p.decision_required)
  const redProjects = projects.filter(p => p.status === 'Red')

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">{format(new Date(),'EEEE, MMMM d yyyy')} · {profile?.full_name}</p>
        </div>
        {(isAdmin || isPM) && (
          <Link to="/projects/new" className="btn-primary whitespace-nowrap">+ New Project</Link>
        )}
      </div>

      {decisionProjects.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {decisionProjects.length} project{decisionProjects.length > 1 ? 's require' : ' requires'} executive decision
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{decisionProjects.map(p=>p.name).join(' · ')}</p>
          </div>
        </div>
      )}

      {redProjects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{redProjects.length} project{redProjects.length>1?'s':''} in RED status</p>
            <p className="text-xs text-red-600 mt-0.5">{redProjects.map(p=>p.name).join(' · ')}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="Total Projects" value={summary.total_projects} icon={Layers} color="blue" />
          <KpiCard title="Green" value={`${summary.green_pct??0}%`} subtitle={`${summary.green_count} projects`} icon={CheckSquare} color="green" />
          <KpiCard title="Amber" value={`${summary.amber_pct??0}%`} subtitle={`${summary.amber_count} projects`} icon={Clock} color="amber" />
          <KpiCard title="Red" value={`${summary.red_pct??0}%`} subtitle={`${summary.red_count} projects`} icon={AlertCircle} color="red" />
          <KpiCard title="Capital Exposure" value={formatCurrency(Math.abs(summary.total_capital_exposure??0))}
            subtitle={(summary.total_capital_exposure??0)>0?'Over budget':'Under budget'}
            icon={DollarSign} color={(summary.total_capital_exposure??0)>0?'red':'green'} />
          <KpiCard title="Total NPV" value={formatCurrency(summary.total_npv??0)} icon={TrendingUp} color="purple" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Status Distribution</h3>
          {summary && <StatusDonut summary={summary} />}
        </div>
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-1">Budget vs Actual</h3>
          <BudgetBar projects={projects} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">All Projects</h3>
          <span className="text-xs text-gray-400">{projects.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Project','Status','Progress','Budget','Bgt Var.','Timeline','IRR','NPV','Decision','PM'].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map(p => {
                const bv = Number(p.budget_variance_pct ?? 0)
                const td = Number(p.timeline_variance_days ?? 0)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link>
                      {p.decision_required && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Decision</span>}
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} size="sm" /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${p.completion_pct}%`}}/>
                        </div>
                        <span className="text-xs text-gray-600">{p.completion_pct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{formatCurrency(p.budget_total)}</td>
                    <td className={`py-3 px-3 font-medium whitespace-nowrap ${Math.abs(bv)>10?'text-red-600':'text-green-600'}`}>{formatPct(bv)}</td>
                    <td className={`py-3 px-3 font-medium whitespace-nowrap ${td>14?'text-red-600':td>0?'text-amber-600':'text-green-600'}`}>
                      {td!==0?`${td>0?'+':''}${td}d`:'On time'}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{p.irr!=null?`${Number(p.irr).toFixed(1)}%`:'—'}</td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{formatCurrency(p.npv)}</td>
                    <td className="py-3 px-3">{p.decision_required?<span className="text-amber-600 font-medium">Yes</span>:<span className="text-gray-300">No</span>}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">{p.project_manager?.full_name??'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {projects.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No projects yet. {(isAdmin||isPM)&&<Link to="/projects/new" className="text-blue-600 hover:underline">Create the first one.</Link>}</p>}
        </div>
      </div>
    </div>
  )
}
