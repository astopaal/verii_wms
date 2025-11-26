import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  goodsReceiptFormSchema,
  type SelectedOrderItem,
  type GoodsReceiptItem,
  type OrderItem,
} from '../types/goods-receipt';
import { goodsReceiptApi } from '../api/goods-receipt-api';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2OrderSelection } from './steps/Step2OrderSelection';

export function GoodsReceiptCreatePage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([]);

  const form = useForm({
    resolver: zodResolver(goodsReceiptFormSchema),
    defaultValues: {
      receiptDate: new Date().toISOString().split('T')[0],
      documentNo: '',
      warehouseId: '',
      projectCode: '',
      isInvoice: false,
      customerId: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => goodsReceiptApi.createGoodsReceipt(data),
    onSuccess: () => {
      navigate('/goods-receipt/list');
    },
  });

  const handleNext = async (): Promise<void> => {
    if (currentStep === 1) {
      const isValid = await form.trigger();
      if (!isValid) return;
    }
    if (currentStep === 2 && selectedItems.length === 0) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleToggleItem = (item: OrderItem): void => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((si) => si.id === item.id);
      if (existingIndex >= 0) {
        return prev.filter((si) => si.id !== item.id);
      }
      return [
        ...prev,
        {
          ...item,
          receiptQuantity: item.quantity,
          isSelected: true,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number): void => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, receiptQuantity: Math.min(quantity, item.quantity) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string): void => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSave = async (): Promise<void> => {
    const formData = form.getValues();
    const goodsReceiptItems: GoodsReceiptItem[] = selectedItems.map((item) => ({
      orderItemId: item.id,
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.receiptQuantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.receiptQuantity,
    }));

    await createMutation.mutateAsync({
      ...formData,
      items: goodsReceiptItems,
    });
  };

  const steps = [
    { label: t('goodsReceipt.create.steps.basicInfo') },
    { label: t('goodsReceipt.create.steps.orderSelection') },
  ];

  const renderStepContent = (): ReactElement => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return (
          <Step2OrderSelection
            selectedItems={selectedItems}
            onToggleItem={handleToggleItem}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        );
      default:
        return <div>{t('goodsReceipt.create.unknownStep')}</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('goodsReceipt.create.title')}</h1>
        <p className="text-muted-foreground">
          {t('goodsReceipt.create.subtitle')}
        </p>
      </div>

      <Breadcrumb
        items={steps.map((step, index) => ({
          label: step.label,
          isActive: index + 1 === currentStep,
        }))}
        className="mb-4"
      />

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].label}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between pt-6 border-t">
                  <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  {t('common.previous')}
                </Button>
                <div className="flex gap-2">
                  {currentStep < steps.length ? (
                    <Button type="button" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={createMutation.isPending || selectedItems.length === 0}
                    >
                      {createMutation.isPending ? t('common.saving') : t('common.save')}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
