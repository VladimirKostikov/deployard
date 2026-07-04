import type { PodSummary } from '@dpd/shared';
import { PodFileManager } from './files/PodFileManager';

interface DeploymentFilesTabProps {
  namespace: string;
  deploymentName: string;
  pods: PodSummary[];
  selectedPod: string;
  onPodChange: (podName: string) => void;
}

export function DeploymentFilesTab({
  namespace,
  deploymentName,
  pods,
  selectedPod,
  onPodChange,
}: DeploymentFilesTabProps) {
  return (
    <PodFileManager
      namespace={namespace}
      deploymentName={deploymentName}
      pods={pods}
      selectedPod={selectedPod}
      onPodChange={onPodChange}
    />
  );
}
