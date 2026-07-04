import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { deploymentIconButtonClass } from './deployment-icon-button';
import { ProjectGroupSettingsDialog } from './ProjectGroupSettingsDialog';

interface ProjectGroupSettingsButtonProps {
  namespace: string;
  partOf: string;
  label: string;
  serviceCount: number;
}

export function ProjectGroupSettingsButton({
  namespace,
  partOf,
  label,
  serviceCount,
}: ProjectGroupSettingsButtonProps) {
  const { t } = useTranslation('deployments');
  const [open, setOpen] = useState(false);
  const settingsLabel = t('projectGroups.settings');

  return (
    <>
      <HoverTooltip label={settingsLabel}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          aria-label={settingsLabel}
          className={`${deploymentIconButtonClass} text-secondary hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent focus-visible:ring-accent/30`}
        >
          <SettingsIcon />
        </button>
      </HoverTooltip>

      <ProjectGroupSettingsDialog
        open={open}
        namespace={namespace}
        partOf={partOf}
        label={label}
        serviceCount={serviceCount}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
