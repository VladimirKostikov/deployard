import type { ComposeImportPreview } from '@dpd/shared';
import { useTranslation } from 'react-i18next';

interface ComposeImportPreviewPanelProps {
  preview: ComposeImportPreview;
}

export function ComposeImportPreviewPanel({ preview }: ComposeImportPreviewPanelProps) {
  const { t } = useTranslation('import');

  return (
    <div className="space-y-4">
      <div className="rounded border border-default bg-elevated p-3 text-sm text-secondary">
        <p>
          {t('preview.project')}: <span className="text-primary">{preview.projectName}</span>
        </p>
        <p>
          {t('preview.namespace')}: <span className="text-primary">{preview.namespace}</span>
        </p>
      </div>

      {preview.warnings.length > 0 && (
        <div className="space-y-2 rounded border border-default bg-elevated p-3">
          <p className="text-sm font-medium text-primary">{t('preview.warnings')}</p>
          <ul className="space-y-1 text-sm text-secondary">
            {preview.warnings.map((warning, index) => (
              <li key={`${warning.code}-${index}`}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-default">
        <table className="min-w-full text-sm">
          <thead className="border-b border-default bg-elevated text-left text-secondary">
            <tr>
              <th className="px-3 py-2">{t('preview.service')}</th>
              <th className="px-3 py-2">{t('preview.image')}</th>
              <th className="px-3 py-2">{t('preview.port')}</th>
              <th className="px-3 py-2">{t('preview.resources')}</th>
            </tr>
          </thead>
          <tbody>
            {preview.services.map((service) => (
              <tr key={service.name} className="border-b border-default last:border-b-0">
                <td className="px-3 py-2 text-primary">{service.name}</td>
                <td className="px-3 py-2 text-secondary">{service.image}</td>
                <td className="px-3 py-2 text-secondary">{service.containerPort}</td>
                <td className="px-3 py-2 text-secondary">
                  {[
                    service.createSecret ? t('preview.secret') : null,
                    service.createService ? t('preview.serviceResource') : null,
                    service.createPvc ? t('preview.pvc') : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
