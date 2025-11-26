import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function GoodsReceiptListPage(): ReactElement {
  const { t } = useTranslation();
  return <div>{t('goodsReceipt.list.title')}</div>;
}

