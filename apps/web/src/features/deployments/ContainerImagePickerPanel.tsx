import { useTranslation } from 'react-i18next';
import { groupImageOptions } from './container-image-groups';
import { ContainerImageOption } from './container-image-options';
import { ContainerImageOptionButton } from './ContainerImageOptionButton';

interface ContainerImagePickerPanelProps {
  options: ContainerImageOption[];
  onSelect: (option: ContainerImageOption) => void;
  onCustomFocus: () => void;
}

export function ContainerImagePickerPanel({
  options,
  onSelect,
  onCustomFocus,
}: ContainerImagePickerPanelProps) {
  const { t } = useTranslation('deployments');
  const grouped = groupImageOptions(options);

  return (
    <div className="image-picker-panel-enter absolute inset-x-0 z-40 mt-2 flex max-h-[min(24rem,55vh)] flex-col overflow-hidden border border-border bg-elevated shadow-lg sm:max-h-96">
      <div className="shrink-0 border-b border-border px-3 py-2 text-xs text-secondary sm:px-4">
        {t('imagePicker.catalogHint', { count: options.length })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onCustomFocus}
          className="mx-2 mb-2 flex w-[calc(100%-1rem)] items-start gap-3 border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:bg-canvas sm:mx-3 sm:w-[calc(100%-1.5rem)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center text-secondary">✎</span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-primary">{t('imagePicker.customTitle')}</span>
            <span className="block text-xs text-secondary">{t('imagePicker.customHint')}</span>
          </span>
        </button>

        {grouped.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-secondary">{t('imagePicker.empty')}</p>
        )}

        {grouped.map(([category, items]) => (
          <section key={category} className="mb-3 last:mb-0">
            <h3 className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-secondary sm:px-4">
              {category}
            </h3>
            <ul className="grid grid-cols-1 gap-0.5 px-1 sm:grid-cols-2 sm:px-2 lg:grid-cols-3">
              {items.map((option) => (
                <ContainerImageOptionButton key={option.image} option={option} onSelect={onSelect} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
