import type { DeploymentSummary } from '@dpd/shared';
import { ProjectGroupDeleteButton } from './ProjectGroupDeleteButton';
import { ProjectGroupDisableButton } from './ProjectGroupDisableButton';
import { ProjectGroupRestartButton } from './ProjectGroupRestartButton';
import { ProjectGroupSettingsButton } from './ProjectGroupSettingsButton';

interface ProjectGroupTableActionsProps {
  namespace: string;
  partOf: string;
  label: string;
  serviceCount: number;
  deploymentNames: string[];
  deployments: DeploymentSummary[];
}

export function ProjectGroupTableActions({
  namespace,
  partOf,
  label,
  serviceCount,
  deploymentNames,
  deployments,
}: ProjectGroupTableActionsProps) {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <ProjectGroupSettingsButton
        namespace={namespace}
        partOf={partOf}
        label={label}
        serviceCount={serviceCount}
      />
      <ProjectGroupRestartButton
        namespace={namespace}
        partOf={partOf}
        deploymentNames={deploymentNames}
      />
      <ProjectGroupDisableButton
        namespace={namespace}
        partOf={partOf}
        deployments={deployments}
      />
      <ProjectGroupDeleteButton namespace={namespace} partOf={partOf} label={label} />
    </div>
  );
}
