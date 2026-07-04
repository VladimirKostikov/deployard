import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setClusterContext } from '../../api/cluster-context';
import { useClusters } from '../../hooks/kubernetes';
import { MobileNavProvider } from './mobile-nav-context';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  variant: 'app' | 'admin';
}

export function AppShell({ variant }: AppShellProps) {
  const { data: clusters = [] } = useClusters();
  const [cluster, setCluster] = useState('');

  useEffect(() => {
    if (!clusters.length) {
      return;
    }

    const defaultCluster = clusters.find((item) => item.current)?.name ?? clusters[0].name;
    setCluster((current) => current || defaultCluster);
  }, [clusters]);

  useEffect(() => {
    setClusterContext(cluster || undefined);
  }, [cluster]);

  return (
    <MobileNavProvider>
      <div className="flex shell-height overflow-hidden bg-canvas">
        <Sidebar variant={variant} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar cluster={cluster} onClusterChange={setCluster} />
          <main className="min-h-0 flex-1 overflow-y-auto bg-canvas p-2 sm:p-4">
            <div className="mx-auto max-w-6xl border border-border bg-elevated p-3 sm:p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
