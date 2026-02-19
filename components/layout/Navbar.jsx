import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAlerts } from '../../hooks/useAlerts'
import { signOut } from '../../lib/auth'
import AlertCenter from '../alerts/AlertCenter'
export default function Navbar() {
  const { profile } = useAuth()
  const { unreadCount } = useAlerts()
  const [open, setOpen] = useState(false)
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">Executive Project Dashboard</p>
        <p className="text-xs text-gray-400">{profile?.role}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setOpen(o => !o)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {open && <AlertCenter onClose={() => setOpen(false)} />}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
            <p className="text-xs text-gray-400">{profile?.email}</p>
          </div>
          <button onClick={signOut} className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 px-3 py-1.5 rounded-lg">Sign out</button>
        </div>
      </div>
    </header>
  )
}
