import { DeleteIcon, EditIcon } from '../../components/icons/ActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';

interface AdminRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}

export function AdminRowActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: AdminRowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <HoverTooltip label={editLabel}>
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-border bg-elevated text-secondary transition-all hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <EditIcon />
        </button>
      </HoverTooltip>
      <HoverTooltip label={deleteLabel}>
        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-border bg-elevated text-secondary transition-all hover:border-danger/40 hover:bg-danger-soft/40 hover:text-danger hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
        >
          <DeleteIcon />
        </button>
      </HoverTooltip>
    </div>
  );
}
