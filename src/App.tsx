import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { HomeRedirect } from '@/pages/HomeRedirect'
import { ManagerDashboard } from '@/pages/ManagerDashboard'
import { ManagerReportsPage } from '@/pages/ManagerReportsPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { EmployeeDashboard } from '@/pages/EmployeeDashboard'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { FilesPage } from '@/pages/FilesPage'
import { FolderDetailPage } from '@/pages/FolderDetailPage'
import { FileDetailPage } from '@/pages/FileDetailPage'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const [authReady, setAuthReady] = useState(false)
  const setCurrentUserId = useAppStore((s) => s.setCurrentUserId)
  const loadAll = useAppStore((s) => s.loadAll)
  const reset = useAppStore((s) => s.reset)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUserId(session.user.id)
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') loadAll()
      } else {
        reset()
      }
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [setCurrentUserId, loadAll, reset])

  if (!authReady) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
          <Route path="/manager/employees/:employeeId" element={<EmployeeDetailPage />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/f/:folderId" element={<FolderDetailPage />} />
          <Route path="/files/:fileId" element={<FileDetailPage />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
