import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppSection } from '@dpd/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { AdminRoute, GuestRoute, ProtectedRoute, SectionRoute } from './auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/ui/toast/toast-context';
import { ToastViewport } from './components/ui/toast/ToastViewport';
import { usePersistedNamespace } from './hooks/usePersistedNamespace';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminRolesPage } from './pages/admin/AdminRolesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { DeploymentDetailPage } from './pages/DeploymentDetailPage';
import { MetricsPage } from './pages/MetricsPage';
import { FaqPage } from './pages/FaqPage';
import { ImportPage } from './pages/ImportPage';
import { LoginPage } from './pages/LoginPage';
import { NamespacesPage } from './pages/NamespacesPage';
import { NetworkPage } from './pages/NetworkPage';
import './i18n';

const queryClient = new QueryClient();

export function App() {
  const [namespace, setNamespace] = usePersistedNamespace();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell variant="app" />}>
                  <Route element={<SectionRoute section={AppSection.DEPLOYMENTS} />}>
                    <Route
                      index
                      element={<DeploymentsPage namespace={namespace} onNamespaceChange={setNamespace} />}
                    />
                    <Route
                      path="deployments/:name"
                      element={<DeploymentDetailPage namespace={namespace} />}
                    />
                  </Route>
                  <Route element={<SectionRoute section={AppSection.METRICS} />}>
                    <Route path="metrics" element={<MetricsPage />} />
                  </Route>
                  <Route path="faq" element={<FaqPage />} />
                  <Route element={<SectionRoute section={AppSection.NAMESPACES} />}>
                    <Route path="namespaces" element={<NamespacesPage />} />
                  </Route>
                  <Route element={<SectionRoute section={AppSection.NETWORK} />}>
                    <Route
                      path="network"
                      element={<NetworkPage namespace={namespace} onNamespaceChange={setNamespace} />}
                    />
                    <Route path="ingress" element={<Navigate to="/network?tab=ingress" replace />} />
                  </Route>
                  <Route element={<SectionRoute section={AppSection.IMPORT} />}>
                    <Route
                      path="import"
                      element={<ImportPage namespace={namespace} onNamespaceChange={setNamespace} />}
                    />
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route
                    element={<AppShell variant="admin" />}
                  >
                    <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/roles" element={<AdminRolesPage />} />
                    <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <ToastViewport />
          </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
