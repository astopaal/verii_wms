import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer(): ReactElement {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          {t('footer.copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}

