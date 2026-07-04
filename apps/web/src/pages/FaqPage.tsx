import { useTranslation } from 'react-i18next';
import { FaqExampleBlock, FaqParagraphs } from '../features/faq/FaqContent';
import { FAQ_SECTIONS } from '../features/faq/faq-sections';

export function FaqPage() {
  const { t } = useTranslation('faq');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('title')}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-secondary">{t('subtitle')}</p>
      </div>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-3">
            <h2 className="text-lg font-medium text-primary">{t(`sections.${section.id}`)}</h2>
            <div className="divide-y divide-border overflow-hidden border border-border bg-elevated">
              {section.items.map((itemId) => (
                <details key={itemId} className="faq-item group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-medium text-primary transition-colors hover:bg-accent-soft/40 sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span>{t(`items.${itemId}.question`)}</span>
                    <span
                      aria-hidden
                      className="shrink-0 text-secondary transition-transform duration-200 group-open:rotate-180"
                    >
                      ▾
                    </span>
                  </summary>
                  <div className="space-y-4 border-t border-border px-4 py-4 text-sm leading-relaxed text-secondary sm:px-5">
                    <FaqParagraphs text={t(`items.${itemId}.answer`)} />

                    <div className="border border-border bg-canvas px-4 py-3">
                      <p className="mb-2 text-xs font-medium text-primary">{t('labels.inApp')}</p>
                      <FaqParagraphs text={t(`items.${itemId}.inApp`)} />
                    </div>

                    <div className="border border-border bg-canvas px-4 py-3">
                      <p className="mb-2 text-xs font-medium text-primary">{t('labels.example')}</p>
                      <FaqExampleBlock text={t(`items.${itemId}.example`)} />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
