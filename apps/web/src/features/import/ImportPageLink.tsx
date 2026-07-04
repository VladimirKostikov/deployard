import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';

export function ImportPageLink() {
  const { t } = useTranslation('import');

  return (
    <Link to="/import">
      <Button variant="secondary">{t('open')}</Button>
    </Link>
  );
}
