import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface OverrideService {
  name: string;
}

interface ImportOptionsPanelProps {
  exposeHostPorts: boolean;
  canLoadImages: boolean;
  loadPending: boolean;
  overrideServices: OverrideService[];
  imageOverrides: Record<string, string>;
  onExposeHostPortsChange: (value: boolean) => void;
  onImageOverrideChange: (service: string, value: string) => void;
  onLoadImages: () => void;
}

export function ImportOptionsPanel({
  exposeHostPorts,
  canLoadImages,
  loadPending,
  overrideServices,
  imageOverrides,
  onExposeHostPortsChange,
  onImageOverrideChange,
  onLoadImages,
}: ImportOptionsPanelProps) {
  const { t } = useTranslation('import');

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={exposeHostPorts}
          onChange={(event) => onExposeHostPortsChange(event.target.checked)}
        />
        <span>
          <span className="font-medium text-primary">{t('flow.exposePortsLabel')}</span>
          <span className="mt-0.5 block text-secondary">{t('flow.exposePortsHint')}</span>
        </span>
      </label>

      {canLoadImages && (
        <div className="space-y-2 border border-border bg-canvas p-4">
          <p className="text-sm font-medium text-primary">{t('flow.loadImagesTitle')}</p>
          <p className="text-xs text-secondary">{t('flow.loadImagesHint')}</p>
          <Button type="button" variant="secondary" size="sm" disabled={loadPending} onClick={onLoadImages}>
            {loadPending ? t('prepare.loading') : t('prepare.load')}
          </Button>
        </div>
      )}

      {overrideServices.length > 0 && (
        <div className="space-y-2 border border-border bg-canvas p-4">
          <p className="text-sm font-medium text-primary">{t('imageOverridesTitle')}</p>
          <p className="text-xs text-secondary">{t('imageOverridesHint')}</p>
          {overrideServices.map((service) => (
            <Input
              key={service.name}
              value={imageOverrides[service.name] ?? ''}
              onChange={(event) => onImageOverrideChange(service.name, event.target.value)}
              placeholder={t('imageOverridePlaceholder', { service: service.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
