interface FlagIconProps {
  className?: string;
}

interface NordicCrossFlagProps extends FlagIconProps {
  field: string;
  cross: string;
  innerCross?: string;
}

export function NordicCrossFlag({
  className = 'h-4 w-5',
  field,
  cross,
  innerCross,
}: NordicCrossFlagProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="14" fill={field} />
      <rect x="5.5" width="2.5" height="14" fill={cross} />
      <rect y="4.75" width="20" height="2.5" fill={cross} />
      {innerCross ? (
        <>
          <rect x="6.25" width="1.25" height="14" fill={innerCross} />
          <rect y="5.375" width="20" height="1.25" fill={innerCross} />
        </>
      ) : null}
    </svg>
  );
}

export function FlagDa({ className = 'h-4 w-5' }: FlagIconProps) {
  return <NordicCrossFlag className={className} field="#C8102E" cross="#fff" />;
}

export function FlagSv({ className = 'h-4 w-5' }: FlagIconProps) {
  return <NordicCrossFlag className={className} field="#006AA7" cross="#FECC00" />;
}

export function FlagFi({ className = 'h-4 w-5' }: FlagIconProps) {
  return <NordicCrossFlag className={className} field="#fff" cross="#003580" />;
}

export function FlagNo({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <NordicCrossFlag
      className={className}
      field="#BA0C2F"
      cross="#fff"
      innerCross="#00205B"
    />
  );
}

export function FlagIs({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <NordicCrossFlag
      className={className}
      field="#02529C"
      cross="#fff"
      innerCross="#DC1E35"
    />
  );
}
