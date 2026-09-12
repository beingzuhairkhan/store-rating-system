import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Unauthorized } from '@/pages/Unauthorized';
import { ChangePassword } from '@/pages/ChangePassword';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminUsers } from '@/pages/admin/Users';
import { UserDetail } from '@/pages/admin/UserDetail';
import { CreateUser } from '@/pages/admin/CreateUser';
import { AdminStores } from '@/pages/admin/Stores';
import { StoreDetail } from '@/pages/admin/StoreDetail';
import { CreateStore } from '@/pages/admin/CreateStore';
import { UserStores } from '@/pages/user/Stores';
import { OwnerDashboard } from '@/pages/owner/Dashboard';
import { OwnerStoreDetail } from '@/pages/owner/OwnerStoreById';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Shared */}
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/create"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <CreateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <UserDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stores"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminStores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stores/create"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <CreateStore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stores/:id"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <StoreDetail />
                    </ProtectedRoute>
                  }
                />

                {/* User */}
                <Route
                  path="/user/stores"
                  element={
                    <ProtectedRoute roles={['USER']}>
                      <UserStores />
                    </ProtectedRoute>
                  }
                />
                <Route path="/user" element={<Navigate to="/user/stores" replace />} />

                {/* Store Owner */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute roles={['STORE_OWNER']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/owner/stores/:id"
                  element={
                    <ProtectedRoute roles={['STORE_OWNER']}>
                      <OwnerStoreDetail />
                    </ProtectedRoute>
                  }
                />
                <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
