import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import type { PodSummary } from '@dpd/shared';
import { LogViewer } from '../logs/LogViewer';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';

interface DeploymentLogsSectionProps {
  namespace: string;
  pods: PodSummary[] | undefined;
  selectedPod: string;
  onPodChange: (podName: string) => void;
}

export function DeploymentLogsSection({
  namespace,
  pods,
  selectedPod,
  onPodChange,
}: DeploymentLogsSectionProps) {
  const { t } = useTranslation('deployments');
  const { name = '' } = useParams();
  const activePod = selectedPod || pods?.[0]?.name || '';

  return (
    <div className="space-y-4">
      {pods && pods.length > 1 && (
        <div className="flex justify-end">
          <Select
            value={activePod}
            onChange={(event) => onPodChange(event.target.value)}
            className="min-w-[12rem]"
          >
            {pods.map((pod) => (
              <option key={pod.name} value={pod.name}>
                {pod.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      {activePod ? (
        <LogViewer namespace={namespace} deployment={name} podName={activePod} />
      ) : (
        <Card className="p-6 text-sm text-secondary">{t('detail.logsEmpty')}</Card>
      )}
    </div>
  );
}
