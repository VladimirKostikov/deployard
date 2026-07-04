import { useTranslation } from 'react-i18next';
import { LanguageFlag } from './icons/LanguageFlag';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { DropdownSelect } from './ui/DropdownSelect';

interface LanguageSwitcherProps {
  fullWidth?: boolean;
  placement?: 'bottom' | 'top';
}

export function LanguageSwitcher({ fullWidth = false, placement = 'bottom' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');

  const activeCode =
    SUPPORTED_LANGUAGES.find((language) => i18n.language.startsWith(language.code))?.code ?? 'en';

  const options = SUPPORTED_LANGUAGES.map((language) => ({
    value: language.code,
    label: language.label,
    icon: <LanguageFlag code={language.code} />,
  }));

  return (
    <DropdownSelect
      value={activeCode}
      options={options}
      onChange={(code) => void i18n.changeLanguage(code)}
      ariaLabel={t('language')}
      fullWidth={fullWidth}
      placement={placement}
      scrollable
    />
  );
}
