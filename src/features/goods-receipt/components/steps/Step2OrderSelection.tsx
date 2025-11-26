import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { goodsReceiptApi } from '../../api/goods-receipt-api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderItemsAccordion } from '../OrderItemsAccordion';
import type {
  GoodsReceiptFormData,
  SelectedOrderItem,
  OrderItem,
} from '../../types/goods-receipt';

interface Step2OrderSelectionProps {
  selectedItems: SelectedOrderItem[];
  onToggleItem: (item: OrderItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function Step2OrderSelection({
  selectedItems,
  onToggleItem,
  onUpdateQuantity,
  onRemoveItem,
}: Step2OrderSelectionProps): ReactElement {
  const { t } = useTranslation();
  const { watch } = useFormContext<GoodsReceiptFormData>();
  const customerId = watch('customerId');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', customerId],
    queryFn: () => goodsReceiptApi.getOrdersByCustomer(customerId),
    enabled: !!customerId,
  });

  if (!customerId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t('goodsReceipt.step2.selectCustomerFirst')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('goodsReceipt.step2.orders')}</h3>
            {ordersLoading && <Badge variant="secondary">{t('common.loading')}</Badge>}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {orders && orders.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border rounded-lg">
                {t('goodsReceipt.step2.noOrders')}
              </div>
            )}

            <Accordion
              type="single"
              collapsible
              value={expandedOrderId || ''}
              onValueChange={setExpandedOrderId}
              className="space-y-2"
            >
              {orders?.map((order) => (
                <AccordionItem
                  key={order.id}
                  value={order.id}
                  className="border rounded px-3"
                >
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{order.orderNo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pb-2">
                      <OrderItemsAccordion
                        orderId={order.id}
                        selectedItems={selectedItems}
                        onToggleItem={onToggleItem}
                        onUpdateQuantity={onUpdateQuantity}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('goodsReceipt.step2.selectedItems')}</h3>
            <Badge variant="secondary">{t('goodsReceipt.step2.selectedItemsCount', { count: selectedItems.length })}</Badge>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {selectedItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 border rounded text-sm">
                {t('goodsReceipt.step2.noItemsSelected')}
              </div>
            ) : (
              selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 border-l-4 border-l-primary rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.productCode} • {item.receiptQuantity} {item.unit}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-7 w-7 p-0 shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
