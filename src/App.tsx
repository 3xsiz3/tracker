import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { HomeRedirect } from '@/pages/HomeRedirect'
import { ManagerDashboard } from '@/pages/ManagerDashboard'
import { ManagerReportsPage } from '@/pages/ManagerReportsPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { EmployeeDashboard } from '@/pages/EmployeeDashboard'
import { TaskDetailPage } from '@/pages/TaskDetailPage'

function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
