import { useTranslation } from 'react-i18next';
import type { ServiceSummary } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useSectionAccess } from '../../auth/use-access';
import { DeleteIcon } from '../../components/icons/ActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { ServiceAccessButton } from './ServiceAccessButton';
import { ServiceAccessUrl } from './ServiceAccessUrl';

interface ServiceTableRowProps {
  namespace: string;
  service: ServiceSummary;
  formatPorts: (ports: ServiceSummary['ports']) => string;
  formatSelector: (selector: Record<string, string>) => string;
  onEdit: (service: ServiceSummary) => void;
  onDelete: (serviceName: string) => void;
}

export function ServiceTableRow({
  namespace,
  service,
  formatPorts,
  formatSelector,
  onEdit,
  onDelete,
}: ServiceTableRowProps) {
  const { t } = useTranslation('network');
  const { canManage } = useSectionAccess(AppSection.NETWORK, namespace);

  return (
    <tr className="border-t border-border">
      <td className="px-5 py-4 pl-8 font-medium text-primary">{service.name}</td>
      <td className="px-5 py-4 text-secondary">{service.type}</td>
      <td className="px-5 py-4 font-mono text-xs text-secondary">{service.clusterIp || '-'}</td>
      <td className="px-5 py-4 text-secondary">{formatPorts(service.ports)}</td>
      <td className="px-5 py-4 text-xs text-secondary">{formatSelector(service.selector)}</td>
      <td className="px-5 py-4">
        <div className="flex flex-col items-start gap-1.5">
          <ServiceAccessUrl service={service} />
          <div className="flex flex-nowrap items-center gap-2">
            <ServiceAccessButton service={service} />
            {canManage ? (
              <>
                <HoverTooltip label={t('services.actions.edit')}>
                  <button
                    type="button"
                    onClick={() => onEdit(service)}
                    aria-label={t('services.actions.edit')}
                    className="inline-flex h-8 shrink-0 items-center justify-center border border-border bg-elevated px-2 text-xs text-secondary transition-all hover:border-accent/40 hover:bg-canvas hover:text-accent"
                  >
                    {t('services.actions.editShort')}
                  </button>
                </HoverTooltip>
                <HoverTooltip label={t('services.actions.delete')}>
                  <button
                    type="button"
                    onClick={() => onDelete(service.name)}
                    aria-label={t('services.actions.delete')}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-elevated text-secondary transition-all hover:border-danger/40 hover:bg-danger-soft/40 hover:text-danger"
                  >
                    <DeleteIcon />
                  </button>
                </HoverTooltip>
              </>
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  );
}
