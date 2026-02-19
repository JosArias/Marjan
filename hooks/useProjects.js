import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    load()
    const ch = supabase.channel('proj').on('postgres_changes',
      { event: '*', schema: 'public', table: 'projects' }, load).subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])

  async function load() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('projects')
        .select('*, project_manager:user_profiles!project_manager_id(full_name,email)')
        .order('updated_at', { ascending: false })
      if (error) throw error
      setProjects(data ?? [])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  return { projects, loading, error, refresh: load }
}

export function useProject(id) {
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [risks, setRisks] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    try {
      setLoading(true)
      const [p, m, r, a] = await Promise.all([
        supabase.from('projects').select('*, project_manager:user_profiles!project_manager_id(full_name,email)').eq('id', id).single(),
        supabase.from('milestones').select('*').eq('project_id', id).order('due_date'),
        supabase.from('risks').select('*').eq('project_id', id).order('risk_score', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('record_id', id).order('created_at', { ascending: false }).limit(50),
      ])
      if (p.error) throw p.error
      setProject(p.data); setMilestones(m.data??[]); setRisks(r.data??[]); setAuditLog(a.data??[])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  return { project, milestones, risks, auditLog, loading, error, refresh: load }
}
