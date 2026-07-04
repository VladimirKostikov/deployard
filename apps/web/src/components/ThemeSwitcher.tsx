import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoThemeIcon, MoonIcon, SunIcon } from './icons/ThemeIcons';
import { useThemeContext } from './ThemeProvider';
import { DropdownSelect } from './ui/DropdownSelect';
import type { ThemeMode } from '../hooks/useTheme';

interface ThemeSwitcherProps {
  fullWidth?: boolean;
  placement?: 'bottom' | 'top';
}

export function ThemeSwitcher({ fullWidth = false, placement = 'bottom' }: ThemeSwitcherProps) {
  const { t } = useTranslation('common');
  const { mode, setMode } = useThemeContext();

  const options: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
    { value: 'light', label: t('theme.light'), icon: <SunIcon /> },
    { value: 'dark', label: t('theme.dark'), icon: <MoonIcon /> },
    { value: 'system', label: t('theme.system'), icon: <AutoThemeIcon /> },
  ];

  return (
    <DropdownSelect
      value={mode}
      options={options}
      onChange={setMode}
      ariaLabel={t('theme.label')}
      fullWidth={fullWidth}
      placement={placement}
    />
  );
}
