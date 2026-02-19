import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data??[]); setLoading(false) })
  }, [])

  async function updateRole(id, role) {
    setSaving(id)
    await supabase.from('user_profiles').update({ role }).eq('id', id)
    setUsers(p => p.map(u => u.id === id ? { ...u, role } : u))
    setSaving(null)
  }

  if (loading) return <div className="flex justify-center pt-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-gray-300 hover:text-gray-600"><ArrowLeft className="w-5 h-5"/></Link>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      </div>
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            {['Name','Email','Role','Joined'].map(h=>(
              <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id}>
                <td className="py-3 px-3 font-medium text-gray-900">{u.full_name??'—'}</td>
                <td className="py-3 px-3 text-gray-500">{u.email}</td>
                <td className="py-3 px-3">
                  <select value={u.role} onChange={e=>updateRole(u.id,e.target.value)}
                    disabled={saving===u.id} className="input text-xs w-40">
                    <option value="Admin">Admin</option>
                    <option value="ProjectManager">Project Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </td>
                <td className="py-3 px-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length===0 && <p className="text-center py-8 text-gray-400 text-sm">No users yet.</p>}
      </div>
    </div>
  )
}
