import { type ReactElement } from 'react';

export function Footer(): ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {currentYear} WMS. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

