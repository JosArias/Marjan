import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import ProjectEdit from './pages/ProjectEdit'
import AdminUsers from './pages/AdminUsers'

function Spinner() {
  return <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
  </div>
}

function Guard({ children, adminOnly }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'Admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="projects/new" element={<ProjectEdit />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/edit" element={<ProjectEdit />} />
        <Route path="admin/users" element={<Guard adminOnly><AdminUsers /></Guard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
