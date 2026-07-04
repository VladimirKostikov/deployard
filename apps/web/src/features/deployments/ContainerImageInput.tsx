import { useTranslation } from 'react-i18next';
import { ContainerImageOption } from './container-image-options';
import { ContainerImagePickerPanel } from './ContainerImagePickerPanel';
import { useContainerImagePicker } from './useContainerImagePicker';

interface ContainerImageInputProps {
  value: string;
  onChange: (value: string) => void;
  onOptionSelect?: (option: ContainerImageOption) => void;
  placeholder?: string;
  className?: string;
}

export function ContainerImageInput({
  value,
  onChange,
  onOptionSelect,
  placeholder,
  className = '',
}: ContainerImageInputProps) {
  const { t } = useTranslation('deployments');
  const picker = useContainerImagePicker({ value, onChange, onOptionSelect });

  return (
    <div ref={picker.rootRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <input
          value={picker.query}
          placeholder={placeholder ?? t('imagePicker.placeholder')}
          onFocus={picker.openPicker}
          onClick={picker.openPicker}
          onChange={(event) => picker.updateQuery(event.target.value)}
          className="field-control h-10 min-w-0 flex-1 border border-border bg-elevated px-3 text-sm text-primary shadow-sm transition-colors placeholder:text-secondary/70 hover:bg-canvas"
        />
        <button
          type="button"
          aria-expanded={picker.open}
          aria-label={t('imagePicker.browse')}
          onClick={() => {
            if (picker.open) {
              picker.setOpen(false);
              return;
            }

            picker.openPicker();
          }}
          className="h-10 shrink-0 border border-border bg-elevated px-3 text-sm text-secondary transition-colors hover:bg-canvas"
        >
          ▾
        </button>
      </div>

      {picker.open && (
        <ContainerImagePickerPanel
          options={picker.filteredOptions}
          onSelect={picker.commitOption}
          onCustomFocus={picker.openPicker}
        />
      )}
    </div>
  );
}
