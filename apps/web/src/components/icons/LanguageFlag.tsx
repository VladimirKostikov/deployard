import type { ComponentType } from 'react';
import { STRIPE_FLAGS } from './language-flag-stripes';
import {
  FlagCs,
  FlagEl,
  FlagEn,
  FlagHr,
  FlagMt,
  FlagPt,
  FlagSk,
  FlagSl,
} from './language-flag-custom';
import { FlagDa, FlagFi, FlagIs, FlagNo, FlagSv } from './language-flag-nordic';

interface LanguageFlagProps {
  code: string;
  className?: string;
}

function StripeFlag({
  className,
  layout,
  colors,
  weights,
}: {
  className: string;
  layout: 'horizontal' | 'vertical';
  colors: string[];
  weights?: number[];
}) {
  const units = weights ?? colors.map(() => 1);
  const total = units.reduce((sum, weight) => sum + weight, 0);

  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      {colors.map((color, index) => {
        const size =
          layout === 'horizontal' ? (14 * units[index]) / total : (20 * units[index]) / total;
        const offset = units
          .slice(0, index)
          .reduce(
            (sum, weight) =>
              sum + (layout === 'horizontal' ? (14 * weight) / total : (20 * weight) / total),
            0,
          );

        if (layout === 'horizontal') {
          return <rect key={color + index} width="20" height={size} y={offset} fill={color} />;
        }

        return <rect key={color + index} width={size} height="14" x={offset} fill={color} />;
      })}
    </svg>
  );
}

const CUSTOM_FLAGS: Record<string, ComponentType<{ className?: string }>> = {
  cs: FlagCs,
  da: FlagDa,
  el: FlagEl,
  en: FlagEn,
  fi: FlagFi,
  hr: FlagHr,
  is: FlagIs,
  mt: FlagMt,
  no: FlagNo,
  pt: FlagPt,
  sk: FlagSk,
  sl: FlagSl,
  sv: FlagSv,
};

export function LanguageFlag({ code, className = 'h-4 w-5' }: LanguageFlagProps) {
  const CustomFlag = CUSTOM_FLAGS[code];
  if (CustomFlag) {
    return <CustomFlag className={className} />;
  }

  const stripe = STRIPE_FLAGS[code];
  if (stripe) {
    return (
      <StripeFlag
        className={className}
        layout={stripe.layout}
        colors={stripe.colors}
        weights={stripe.weights}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="14" fill="var(--color-border)" />
      <text x="10" y="9" textAnchor="middle" fontSize="6" fill="var(--color-secondary)">
        {code.toUpperCase()}
      </text>
    </svg>
  );
}
