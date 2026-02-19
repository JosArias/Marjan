import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    load()
    const ch = supabase.channel('alerts-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, ({ new: a }) => {
        setAlerts(p => [a, ...p])
        setUnreadCount(p => p + 1)
        if (Notification?.permission === 'granted') new Notification('Project Alert', { body: a.message })
      }).subscribe()
    if (Notification?.permission === 'default') Notification.requestPermission()
    return () => supabase.removeChannel(ch)
  }, [user])

  async function load() {
    const { data } = await supabase.from('alerts')
      .select('*, project:projects(name)').order('sent_at', { ascending: false }).limit(50)
    setAlerts(data ?? [])
    setUnreadCount((data ?? []).filter(a => !a.is_read).length)
  }

  async function markRead(id) {
    await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
    setAlerts(p => p.map(a => a.id === id ? { ...a, is_read: true } : a))
    setUnreadCount(p => Math.max(0, p - 1))
  }

  async function markAllRead() {
    const ids = alerts.filter(a => !a.is_read).map(a => a.id)
    if (!ids.length) return
    await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).in('id', ids)
    setAlerts(p => p.map(a => ({ ...a, is_read: true })))
    setUnreadCount(0)
  }

  return { alerts, unreadCount, markRead, markAllRead }
}
