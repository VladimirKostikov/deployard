import { useTranslation } from 'react-i18next';
import { AccessLevel, AppSection } from '@dpd/shared';
import { useAuth } from '../../auth/auth-context';
import { useAccess } from '../../auth/use-access';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { Button } from '../ui/Button';
import {
  AdminIcon,
  BackIcon,
  CloseIcon,
  DeploymentsIcon,
  FaqIcon,
  ImportIcon,
  NetworkIcon,
  LogoutIcon,
  MetricsIcon,
  NamespacesIcon,
  PermissionsIcon,
  RolesIcon,
  UsersIcon,
} from '../icons/NavIcons';
import { useMobileNav } from './mobile-nav-context';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarProps {
  variant: 'app' | 'admin';
}

export function Sidebar({ variant }: SidebarProps) {
  const { t } = useTranslation('layout');
  const { user, logout } = useAuth();
  const { canAccess } = useAccess();
  const { isOpen, close } = useMobileNav();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label={t('mobileMenu.close')}
          onClick={close}
        />
      ) : null}

      <aside
        className={[
          'font-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-[min(100vw-3rem,15rem)] shrink-0 flex-col border-r border-border bg-sidebar transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <h1 className="truncate text-[18px] font-semibold tracking-tight text-primary">
            {t('appTitle')}
          </h1>
          <button
            type="button"
            className="rounded-apple p-1.5 text-secondary transition-colors hover:bg-accent-soft hover:text-primary lg:hidden"
            aria-label={t('mobileMenu.close')}
            onClick={close}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {variant === 'app' ? (
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[12px] font-medium text-secondary">{t('sections.main')}</p>
              {canAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW) ? (
                <SidebarNavItem
                  to="/"
                  end
                  label={t('nav.deployments')}
                  icon={<DeploymentsIcon />}
                />
              ) : null}
              {canAccess(AppSection.NETWORK, AccessLevel.VIEW) ? (
                <SidebarNavItem to="/network" label={t('nav.network')} icon={<NetworkIcon />} />
              ) : null}
              {canAccess(AppSection.NAMESPACES, AccessLevel.VIEW) ? (
                <SidebarNavItem to="/namespaces" label={t('nav.namespaces')} icon={<NamespacesIcon />} />
              ) : null}
              {canAccess(AppSection.IMPORT, AccessLevel.VIEW) ? (
                <SidebarNavItem to="/import" label={t('nav.import')} icon={<ImportIcon />} />
              ) : null}
              {canAccess(AppSection.METRICS, AccessLevel.VIEW) ? (
                <SidebarNavItem to="/metrics" label={t('nav.metrics')} icon={<MetricsIcon />} />
              ) : null}
              {canAccess(AppSection.ADMIN, AccessLevel.MANAGE) ? (
                <SidebarNavItem to="/admin/users" label={t('nav.admin')} icon={<AdminIcon />} />
              ) : null}
              <SidebarNavItem to="/faq" label={t('nav.faq')} icon={<FaqIcon />} />
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[12px] font-medium text-secondary">{t('sections.admin')}</p>
              <SidebarNavItem to="/admin/users" end label={t('nav.users')} icon={<UsersIcon />} />
              <SidebarNavItem to="/admin/roles" label={t('nav.roles')} icon={<RolesIcon />} />
              <SidebarNavItem
                to="/admin/permissions"
                label={t('nav.permissions')}
                icon={<PermissionsIcon />}
              />
              <SidebarNavItem to="/" label={t('nav.backToApp')} icon={<BackIcon />} />
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-border">
          <div className="space-y-2 px-4 py-3">
            <p className="px-1 text-[12px] font-medium text-secondary">{t('sections.settings')}</p>
            <LanguageSwitcher fullWidth placement="top" />
            <ThemeSwitcher fullWidth placement="top" />
          </div>

          <div className="space-y-3 border-t border-border px-4 py-3">
            <div className="px-1">
              <p className="truncate text-[14px] font-medium text-primary">{user?.displayName}</p>
              <p className="truncate text-[12px] text-secondary">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-start px-1 text-danger hover:bg-transparent hover:text-danger"
              onClick={() => void logout()}
            >
              <LogoutIcon className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
