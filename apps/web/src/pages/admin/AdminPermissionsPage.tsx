import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { AdminPageHeader } from '../../features/admin/AdminPageHeader';
import { PermissionTag } from '../../features/admin/PermissionTag';

export function AdminPermissionsPage() {
  const { t } = useTranslation('admin');

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => api.getAdminPermissions(),
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('permissions.title')} subtitle={t('permissions.subtitle')} />

      <Card className="overflow-hidden">
        <TableScroll>
          <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('access.section')}</th>
              <th className="px-5 py-3 font-semibold">{t('access.level')}</th>
              <th className="px-5 py-3 font-semibold">{t('permissions.namespace')}</th>
            </tr>
          </thead>
          <tbody>
            {(permissionsQuery.data ?? []).map((permission) => (
              <tr key={permission.id} className="border-t border-border hover:bg-canvas">
                <td className="px-5 py-4">
                  <PermissionTag
                    section={permission.section}
                    level={permission.level}
                    namespace={permission.namespace}
                  />
                </td>
                <td className="px-5 py-4 text-secondary">{t(`access.levels.${permission.level}`)}</td>
                <td className="px-5 py-4 text-secondary">{permission.namespace ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableScroll>
      </Card>
    </div>
  );
}
