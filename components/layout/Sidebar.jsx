import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
export default function Sidebar() {
  const { isAdmin } = useAuth()
  const nav = (to, Icon, label) => (
    <NavLink to={to} end className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon className="w-5 h-5" />{label}
    </NavLink>
  )
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-xs">MJ</span>
        </div>
        <span className="font-bold text-gray-900">Marjan</span>
      </div>
      <nav className="space-y-1 flex-1">
        {nav('/', LayoutDashboard, 'Dashboard')}
        {isAdmin && nav('/admin/users', Users, 'Users')}
      </nav>
      <p className="text-xs text-gray-400 px-3">v1.0 · Free Tier</p>
    </aside>
  )
}
