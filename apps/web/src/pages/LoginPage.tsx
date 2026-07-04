import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'layout']);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const redirect = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirect, { replace: true });
    } catch {
      setError(t('auth:login.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-6 sm:top-6 sm:gap-3">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md border border-border p-6 sm:p-8">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            {t('layout:appTitle')}
          </h1>
          <p className="text-lg font-medium text-secondary">{t('auth:login.title')}</p>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-secondary">{t('auth:login.email')}</span>
            <Input
              type="email"
              data-testid="login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-secondary">{t('auth:login.password')}</span>
            <Input
              type="password"
              data-testid="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-apple border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            data-testid="login-submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? t('auth:login.submitting') : t('auth:login.submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
