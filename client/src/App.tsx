import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DnevnikRadaStroja } from './pages/DnevnikRadaStroja';
import { ManageStrojevi } from './pages/ManageStrojevi';
import { ManageGradilista } from './pages/ManageGradilista';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dnevnik-rada-stroja"
            element={
              <ProtectedRoute roles={['user']}>
                <DnevnikRadaStroja />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/strojevi"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageStrojevi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gradilista"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageGradilista />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
