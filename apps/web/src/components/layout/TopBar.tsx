import { useTranslation } from 'react-i18next';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { ClusterSelector } from '../ClusterSelector';
import { MenuIcon } from '../icons/NavIcons';
import { useClusters, useHealth } from '../../hooks/kubernetes';
import { useMobileNav } from './mobile-nav-context';

interface TopBarProps {
  cluster: string;
  onClusterChange: (cluster: string) => void;
}

export function TopBar({ cluster, onClusterChange }: TopBarProps) {
  const { t } = useTranslation('layout');
  const { data: health } = useHealth();
  const { data: clusters = [] } = useClusters();
  const { open } = useMobileNav();
  const isConnected = health?.status === 'ok';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-elevated px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="rounded-apple p-1.5 text-secondary transition-colors hover:bg-accent-soft hover:text-primary lg:hidden"
          aria-label={t('mobileMenu.open')}
          onClick={open}
        >
          <MenuIcon />
        </button>

        <StatusIndicator variant={isConnected ? 'ok' : 'idle'} pulse={!isConnected}>
          <span className="truncate text-sm text-secondary">
            {isConnected ? t('topbar.connected') : t('topbar.checking')}
          </span>
        </StatusIndicator>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ClusterSelector clusters={clusters} value={cluster} onChange={onClusterChange} />
      </div>
    </header>
  );
}
