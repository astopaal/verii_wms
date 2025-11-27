import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUIStore } from '@/stores/ui-store';
import {
  createGoodsReceiptFormSchema,
  type SelectedOrderItem,
  type OrderItem,
  type GoodsReceiptFormData,
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
  const { setPageTitle } = useUIStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([]);

  useEffect(() => {
    setPageTitle(t('goodsReceipt.create.title', 'Yeni Mal Kabul Girişi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const schema = useMemo(() => createGoodsReceiptFormSchema(t), [t]);

  const form = useForm({
    resolver: zodResolver(schema),
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
    mutationFn: async (formData: GoodsReceiptFormData) => {
      return goodsReceiptApi.createGoodsReceipt(formData, selectedItems);
    },
    onSuccess: () => {
      toast.success(t('goodsReceipt.create.success', 'Mal kabul başarıyla oluşturuldu'));
      navigate('/goods-receipt/list');
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t('goodsReceipt.create.error', 'Mal kabul oluşturulurken bir hata oluştu')
      );
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

  const handleUpdateItem = (itemId: string, updates: Partial<SelectedOrderItem>): void => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string): void => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSave = async (): Promise<void> => {
    const formData = form.getValues();
    await createMutation.mutateAsync(formData);
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
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        );
      default:
        return <div>{t('goodsReceipt.create.unknownStep')}</div>;
    }
  };

  return (
    <div className="space-y-6">
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
