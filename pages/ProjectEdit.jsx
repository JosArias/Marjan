import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const EMPTY = { name:'', description:'', executive_summary:'', status:'Green', completion_pct:0,
  budget_total:0, budget_actual:0, irr:'', npv:'', start_date:'', end_date:'',
  updated_end_date:'', decision_required:false, decision_notes:'' }

export default function ProjectEdit() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [milestones, setMilestones] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!isNew) load() }, [id])

  async function load() {
    const [p, m, r] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('milestones').select('*').eq('project_id', id).order('due_date'),
      supabase.from('risks').select('*').eq('project_id', id),
    ])
    if (p.data) setForm({ ...EMPTY, ...p.data, irr: p.data.irr??'', npv: p.data.npv??'', updated_end_date: p.data.updated_end_date??'' })
    setMilestones(m.data??[]); setRisks(r.data??[]); setLoading(false)
  }

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form,
        budget_total: Number(form.budget_total), budget_actual: Number(form.budget_actual),
        completion_pct: Number(form.completion_pct),
        irr: form.irr !== '' ? Number(form.irr) : null,
        npv: form.npv !== '' ? Number(form.npv) : null,
        updated_end_date: form.updated_end_date || null,
        project_manager_id: profile.id, created_by: profile.id,
      }
      delete payload.budget_variance_pct; delete payload.timeline_variance_days

      let pid = id
      if (isNew) {
        const { data, error } = await supabase.from('projects').insert(payload).select('id').single()
        if (error) throw error; pid = data.id
      } else {
        const { error } = await supabase.from('projects').update(payload).eq('id', id)
        if (error) throw error
      }

      // Save new milestones
      const newMs = milestones.filter(m => m._new)
      if (newMs.length) {
        await supabase.from('milestones').insert(newMs.map(({ _new, id: _, ...m }) => ({ ...m, project_id: pid })))
      }
      // Save new risks
      const newR = risks.filter(r => r._new)
      if (newR.length) {
        await supabase.from('risks').insert(newR.map(({ _new, id: _, ...r }) => ({ ...r, project_id: pid })))
      }

      navigate(`/projects/${pid}`)
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const addMs = () => setMilestones(p => [...p, { _new:true, id:crypto.randomUUID(), name:'', due_date:'', status:'Not Started', owner:'' }])
  const addRisk = () => setRisks(p => [...p, { _new:true, id:crypto.randomUUID(), title:'', description:'', probability:3, impact:3, mitigation:'', owner:'', status:'Open' }])
  const updMs = (i, k, v) => setMilestones(p => p.map((m,j)=>j===i?{...m,[k]:v}:m))
  const updRisk = (i, k, v) => setRisks(p => p.map((r,j)=>j===i?{...r,[k]:v}:r))
  const delMs = (i) => setMilestones(p => p.filter((_,j)=>j!==i))
  const delRisk = (i) => setRisks(p => p.filter((_,j)=>j!==i))

  if (loading) return <div className="flex justify-center pt-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={isNew?'/':'/projects/'+id} className="text-gray-300 hover:text-gray-600"><ArrowLeft className="w-5 h-5"/></Link>
        <h2 className="text-2xl font-bold text-gray-900">{isNew?'New Project':'Edit Project'}</h2>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Info</h3>
          <div><label className="label">Project Name *</label><input value={form.name} onChange={e=>field('name',e.target.value)} className="input" required /></div>
          <div><label className="label">Description</label><textarea value={form.description} onChange={e=>field('description',e.target.value)} className="input" rows={2}/></div>
          <div><label className="label">Executive Summary</label><textarea value={form.executive_summary} onChange={e=>field('executive_summary',e.target.value)} className="input" rows={4} placeholder="High-level summary for executives…"/></div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Status & Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Status</label>
              <select value={form.status} onChange={e=>field('status',e.target.value)} className="input">
                <option>Green</option><option>Amber</option><option>Red</option>
              </select>
            </div>
            <div><label className="label">Completion %</label><input type="number" min={0} max={100} value={form.completion_pct} onChange={e=>field('completion_pct',e.target.value)} className="input"/></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="dr" checked={form.decision_required} onChange={e=>field('decision_required',e.target.checked)} className="w-4 h-4 rounded border-gray-300"/>
            <label htmlFor="dr" className="text-sm font-medium text-gray-700">Decision Required</label>
          </div>
          {form.decision_required && <div><label className="label">Decision Notes</label><textarea value={form.decision_notes} onChange={e=>field('decision_notes',e.target.value)} className="input" rows={3}/></div>}
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Budget & Financials</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Budget Total ($)</label><input type="number" value={form.budget_total} onChange={e=>field('budget_total',e.target.value)} className="input"/></div>
            <div><label className="label">Budget Actual ($)</label><input type="number" value={form.budget_actual} onChange={e=>field('budget_actual',e.target.value)} className="input"/></div>
            <div><label className="label">IRR (%)</label><input type="number" step="0.01" value={form.irr} onChange={e=>field('irr',e.target.value)} className="input" placeholder="e.g. 14.2"/></div>
            <div><label className="label">NPV ($)</label><input type="number" value={form.npv} onChange={e=>field('npv',e.target.value)} className="input"/></div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Date *</label><input type="date" value={form.start_date} onChange={e=>field('start_date',e.target.value)} className="input" required/></div>
            <div><label className="label">Original End *</label><input type="date" value={form.end_date} onChange={e=>field('end_date',e.target.value)} className="input" required/></div>
            <div><label className="label">Revised End</label><input type="date" value={form.updated_end_date} onChange={e=>field('updated_end_date',e.target.value)} className="input"/></div>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Milestones</h3>
            <button type="button" onClick={addMs} className="btn-secondary text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5"/>Add</button>
          </div>
          {milestones.map((ms,i)=>(
            <div key={ms.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg relative">
              <input placeholder="Milestone name" value={ms.name} onChange={e=>updMs(i,'name',e.target.value)} className="input text-xs col-span-2 sm:col-span-1"/>
              <input type="date" value={ms.due_date} onChange={e=>updMs(i,'due_date',e.target.value)} className="input text-xs"/>
              <input placeholder="Owner" value={ms.owner} onChange={e=>updMs(i,'owner',e.target.value)} className="input text-xs"/>
              <div className="flex gap-1">
                <select value={ms.status} onChange={e=>updMs(i,'status',e.target.value)} className="input text-xs flex-1">
                  {['Not Started','In Progress','Complete','Delayed'].map(s=><option key={s}>{s}</option>)}
                </select>
                <button type="button" onClick={()=>delMs(i)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Risks</h3>
            <button type="button" onClick={addRisk} className="btn-secondary text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5"/>Add Risk</button>
          </div>
          {risks.map((risk,i)=>(
            <div key={risk.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Risk title" value={risk.title} onChange={e=>updRisk(i,'title',e.target.value)} className="input text-xs"/>
                <input placeholder="Description" value={risk.description} onChange={e=>updRisk(i,'description',e.target.value)} className="input text-xs"/>
              </div>
              <div className="grid grid-cols-4 gap-2 items-end">
                <div><label className="text-xs text-gray-400">Probability (1–5)</label><input type="number" min={1} max={5} value={risk.probability} onChange={e=>updRisk(i,'probability',Number(e.target.value))} className="input text-xs"/></div>
                <div><label className="text-xs text-gray-400">Impact (1–5)</label><input type="number" min={1} max={5} value={risk.impact} onChange={e=>updRisk(i,'impact',Number(e.target.value))} className="input text-xs"/></div>
                <div><label className="text-xs text-gray-400">Score</label><div className="input text-xs font-bold bg-white">{risk.probability*risk.impact}</div></div>
                <div className="flex gap-1">
                  <select value={risk.status} onChange={e=>updRisk(i,'status',e.target.value)} className="input text-xs flex-1">
                    {['Open','Mitigated','Closed','Accepted'].map(s=><option key={s}>{s}</option>)}
                  </select>
                  <button type="button" onClick={()=>delRisk(i)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end pb-6">
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':isNew?'Create Project':'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
