import { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUserDetail } from '../hooks/useUserDetail';
import { useCreateUserDetail } from '../hooks/useCreateUserDetail';
import { useUpdateUserDetail } from '../hooks/useUpdateUserDetail';
import { useUploadProfilePicture } from '../hooks/useUploadProfilePicture';
import { useDeleteProfilePicture } from '../hooks/useDeleteProfilePicture';
import { createUserDetailFormSchema, type UserDetailFormData, Gender } from '../types/user-detail';
import { Loader2, Upload, Trash2 } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export function UserDetailModal({ isOpen, onClose }: UserDetailModalProps): ReactElement {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletePictureDialogOpen, setDeletePictureDialogOpen] = useState(false);

  const { data: userDetail, isLoading: isLoadingUserDetail, refetch } = useUserDetail();
  const createMutation = useCreateUserDetail();
  const updateMutation = useUpdateUserDetail();
  const uploadMutation = useUploadProfilePicture();
  const deleteMutation = useDeleteProfilePicture();

  const schema = useMemo(() => createUserDetailFormSchema(t), [t]);

  const form = useForm<UserDetailFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      profilePictureUrl: '',
      height: null,
      weight: null,
      description: '',
      gender: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const getFullImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = api.defaults.baseURL || 'http://localhost:5000';
    return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    if (userDetail) {
      setIsEditMode(true);
      form.reset({
        profilePictureUrl: userDetail.profilePictureUrl || '',
        height: userDetail.height ?? null,
        weight: userDetail.weight ?? null,
        description: userDetail.description || '',
        gender: userDetail.gender ?? null,
      });
      if (userDetail.profilePictureUrl) {
        const fullUrl = getFullImageUrl(userDetail.profilePictureUrl);
        setPreviewImage(fullUrl);
      } else {
        setPreviewImage(null);
      }
    } else if (!isLoadingUserDetail && isOpen) {
      setIsEditMode(false);
      form.reset({
        profilePictureUrl: '',
        height: null,
        weight: null,
        description: '',
        gender: null,
      });
      setPreviewImage(null);
    }
  }, [userDetail, isLoadingUserDetail, isOpen, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      form.setError('profilePictureUrl', {
        type: 'manual',
        message: t('userDetail.invalidFileFormat', 'Geçersiz dosya formatı. Sadece JPG, PNG, GIF, WEBP formatları desteklenir.'),
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      form.setError('profilePictureUrl', {
        type: 'manual',
        message: t('userDetail.fileSizeExceeded', 'Dosya boyutu çok büyük. Maksimum 5 MB olmalıdır.'),
      });
      return;
    }

    form.clearErrors('profilePictureUrl');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = (): void => {
    if (!selectedFile) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(t('userDetail.profilePictureUploadedSuccessfully', 'Profil resmi başarıyla yüklendi'));
          form.setValue('profilePictureUrl', response.data);
          const fullUrl = getFullImageUrl(response.data);
          setPreviewImage(fullUrl);
          setSelectedFile(null);
          refetch();
        } else {
          toast.error(response.message || t('userDetail.profilePictureUploadError', 'Profil resmi yüklenemedi'));
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('userDetail.profilePictureUploadError', 'Profil resmi yüklenirken bir hata oluştu'));
      },
    });
  };

  const handleDeletePictureClick = (): void => {
    if (!userDetail?.profilePictureUrl) return;
    setDeletePictureDialogOpen(true);
  };

  const handleDeletePictureConfirm = (): void => {
    deleteMutation.mutate(undefined as never, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(t('userDetail.profilePictureDeletedSuccessfully', 'Profil resmi başarıyla silindi'));
          setDeletePictureDialogOpen(false);
          form.setValue('profilePictureUrl', '');
          setPreviewImage(null);
          setSelectedFile(null);
          refetch();
        } else {
          toast.error(response.message || t('userDetail.profilePictureDeleteError', 'Profil resmi silinemedi'));
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('userDetail.profilePictureDeleteError', 'Profil resmi silinirken bir hata oluştu'));
        setDeletePictureDialogOpen(false);
      },
    });
  };

  const handleSubmit = (data: UserDetailFormData): void => {
    if (isEditMode) {
      updateMutation.mutate(
        {
          profilePictureUrl: data.profilePictureUrl || undefined,
          height: data.height ?? undefined,
          weight: data.weight ?? undefined,
          description: data.description || undefined,
          gender: (data.gender ?? undefined) as Gender | undefined,
        },
        {
          onSuccess: () => {
            toast.success(t('userDetail.updatedSuccessfully', 'Kullanıcı detayı başarıyla güncellendi'));
            onClose();
          },
          onError: (error: Error) => {
            toast.error(error.message || t('userDetail.updateError', 'Kullanıcı detayı güncellenirken bir hata oluştu'));
          },
        }
      );
    } else {
      if (!user?.id) {
        toast.error(t('userDetail.userNotFound', 'Kullanıcı bulunamadı'));
        return;
      }
      createMutation.mutate(
        {
          userId: user.id,
          profilePictureUrl: data.profilePictureUrl || undefined,
          height: data.height ?? undefined,
          weight: data.weight ?? undefined,
          description: data.description || undefined,
          gender: (data.gender ?? undefined) as Gender | undefined,
        },
        {
          onSuccess: () => {
            toast.success(t('userDetail.createdSuccessfully', 'Kullanıcı detayı başarıyla oluşturuldu'));
            onClose();
          },
          onError: (error: Error) => {
            toast.error(error.message || t('userDetail.createError', 'Kullanıcı detayı oluşturulurken bir hata oluştu'));
          },
        }
      );
    }
  };

  const descriptionLength = form.watch('description')?.length || 0;
  const isLoading = isLoadingUserDetail || createMutation.isPending || updateMutation.isPending;
  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('userDetail.title', 'Kullanıcı Detayları')}</DialogTitle>
          <DialogDescription>
            {t('userDetail.subtitle', 'Kullanıcı detay bilgilerinizi güncelleyin')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUserDetail ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={t('userDetail.profilePicture', 'Profil Resmi')}
                        className="size-32 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="size-32 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">
                          {t('userDetail.noImage', 'Resim Yok')}
                        </span>
                      </div>
                    )}
                    {userDetail?.profilePictureUrl && !selectedFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -bottom-2 -right-2 size-8 rounded-full"
                        onClick={handleDeletePictureClick}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="size-4 mr-2" />
                      {t('userDetail.selectFile', 'Dosya Seç')}
                    </Button>
                    {selectedFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button
                          type="button"
                          onClick={handleUploadPicture}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              {t('userDetail.uploading', 'Yükleniyor...')}
                            </>
                          ) : (
                            <>
                              <Upload className="size-4 mr-2" />
                              {t('userDetail.upload', 'Yükle')}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="profilePictureUrl"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userDetail.height', 'Boy (cm)')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="300"
                            placeholder="175.5"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userDetail.weight', 'Kilo (kg)')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="500"
                            placeholder="75.5"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userDetail.gender', 'Cinsiyet')}</FormLabel>
                      <Select
                        value={field.value?.toString() ?? Gender.NotSpecified.toString()}
                        onValueChange={(value) => {
                          const numValue = parseInt(value, 10);
                          field.onChange(numValue === Gender.NotSpecified ? null : (numValue as Gender));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('userDetail.selectGender', 'Cinsiyet seçiniz')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Gender.NotSpecified.toString()}>
                            {t('userDetail.gender.notSpecified', 'Belirtilmemiş')}
                          </SelectItem>
                          <SelectItem value={Gender.Male.toString()}>
                            {t('userDetail.gender.male', 'Erkek')}
                          </SelectItem>
                          <SelectItem value={Gender.Female.toString()}>
                            {t('userDetail.gender.female', 'Kadın')}
                          </SelectItem>
                          <SelectItem value={Gender.Other.toString()}>
                            {t('userDetail.gender.other', 'Diğer')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userDetail.description', 'Açıklama')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('userDetail.descriptionPlaceholder', 'Açıklama giriniz...')}
                          maxLength={2000}
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {descriptionLength}/2000
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  {t('common.cancel', 'İptal')}
                </Button>
                <Button type="submit" disabled={isLoading || isUploading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {t('common.saving', 'Kaydediliyor...')}
                    </>
                  ) : isEditMode ? (
                    t('common.update', 'Güncelle')
                  ) : (
                    t('common.save', 'Kaydet')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>

      <Dialog open={deletePictureDialogOpen} onOpenChange={setDeletePictureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('userDetail.deletePictureTitle', 'Profil Resmini Sil')}</DialogTitle>
            <DialogDescription>
              {t('userDetail.deletePictureMessage', 'Profil resmini silmek istediğinize emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePictureDialogOpen(false)}>
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePictureConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {t('common.loading', 'Yükleniyor...')}
                </>
              ) : (
                t('common.delete', 'Sil')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
