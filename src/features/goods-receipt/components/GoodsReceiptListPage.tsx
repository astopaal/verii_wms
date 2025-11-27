import { type ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';

export function GoodsReceiptListPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();

  useEffect(() => {
    setPageTitle(t('goodsReceipt.list.title', 'Mal Kabul Listesi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  return <div>{t('goodsReceipt.list.title')}</div>;
}

