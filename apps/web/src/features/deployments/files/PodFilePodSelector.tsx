import type { PodSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Select } from '../../../components/ui/Select';

interface PodFilePodSelectorProps {
  pods: PodSummary[];
  selectedPod: string;
  onPodChange: (podName: string) => void;
}

export function PodFilePodSelector({ pods, selectedPod, onPodChange }: PodFilePodSelectorProps) {
  const { t } = useTranslation('deployments');

  if (pods.length <= 1) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Select
        value={selectedPod}
        onChange={(event) => onPodChange(event.target.value)}
        className="min-w-[14rem]"
        aria-label={t('files.pod')}
      >
        {pods.map((pod) => (
          <option key={pod.name} value={pod.name}>
            {pod.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
