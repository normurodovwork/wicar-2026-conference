import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';
import { FileText, CheckCircle, Clock, XCircle, LayoutDashboard, Settings, Image as ImageIcon, ShieldCheck, Download, Trash2, CreditCard, Smartphone, Mail, Phone, DollarSign, Users } from 'lucide-react';

interface FileUploadCardProps {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accept: string;
  file?: any;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  onDelete?: (fileId: number) => void;
}

const FileUploadCard = ({ type, title, description, icon: Icon, accept, file, isUploading, onUpload, onDelete, t }: FileUploadCardProps & { t: (key: string) => string }) => (
  <div className="p-4 sm:p-6 border border-border bg-card space-y-3 sm:space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-conference-blue-foreground" />
        </div>
        <div>
          <h4 className="font-bold text-conference-blue-foreground text-sm">{title}</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {file && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />}
    </div>

    {file ? (
      <div className="flex items-center gap-2 sm:gap-3 pt-3 border-t border-border">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-conference-blue-foreground truncate">{file.original_name}</p>
          <p className="text-[10px] text-muted-foreground">{t('dashboard.file_uploaded')}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <a href={file.file_url} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-conference-blue-foreground">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </a>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(file.id)}
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
          <Label htmlFor={`${type}-upload`} className="cursor-pointer">
            <div className="text-[10px] sm:text-xs font-bold text-conference-accent uppercase tracking-wider hover:underline">
              {t('dashboard.file_replace')}
            </div>
          </Label>
          <input id={`${type}-upload`} type="file" className="hidden" accept={accept} onChange={(e) => onUpload(e, type)} />
        </div>
      </div>
    ) : (
      <Label htmlFor={`${type}-upload`} className="block">
        <div className="w-full h-10 sm:h-11 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold text-muted-foreground cursor-pointer hover:border-conference-accent hover:text-conference-accent transition-all">
          {isUploading ? t('dashboard.file_uploading') : t('dashboard.file_select')}
        </div>
        <input id={`${type}-upload`} type="file" className="hidden" accept={accept} onChange={(e) => onUpload(e, type)} disabled={isUploading} />
      </Label>
    )}
  </div>
);

// Компонент карты оплаты
const PaymentCard = ({ paymentInfo, amount, currency, shouldPay, message, paymentConfirmed, getFileByType, handleFileUpload, handleFileDelete, uploadingType, t }: any) => {
  return (
    <div className="p-4 sm:p-6 border border-border bg-gradient-to-br from-card to-muted/30 space-y-4 sm:space-y-6 rounded-xl">
      {/* Статус подтверждения */}
      {paymentConfirmed && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-xs font-bold text-green-600">{t('dashboard.payment_confirmed_by_organizer')}</p>
        </div>
      )}

      {/* Сумма оплаты / сообщение */}
      <div className={`p-3 rounded-lg ${shouldPay && amount > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">{t('dashboard.payment_amount_label')}</p>
            {shouldPay && amount > 0 ? (
              <p className="text-xl font-bold text-green-600">
                {amount.toLocaleString()} <span className="text-sm">{currency}</span>
              </p>
            ) : (
              <p className="text-xs font-bold text-amber-600">{t('dashboard.no_payment_required')}</p>
            )}
          </div>
          {shouldPay && amount > 0 && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{message === 'pending_approval' ? t('dashboard.payment_pending_msg') : message}</p>
      </div>

      {/* Карта + Загрузка чека — на десктопе в 2 колонки */}
      {shouldPay && amount > 0 && !paymentConfirmed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Левая колонка — Сумма + Карта */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-conference-blue to-conference-blue-deep text-white rounded-xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <CreditCard className="h-5 w-5 opacity-80" />
                <span className="text-[10px] font-bold opacity-60">{paymentInfo.card_bank}</span>
              </div>
              <div className="mb-3">
                <p className="text-lg font-mono tracking-widest">{paymentInfo.card_number}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">{t('dashboard.card_holder_label')}</p>
                  <p className="text-xs font-bold uppercase">{paymentInfo.card_holder}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">{t('dashboard.payment_sum_label')}</p>
                  <p className="text-sm font-bold">{amount.toLocaleString()} {currency}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка — Загрузка чека */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-conference-blue-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t('dashboard.upload_payment_receipt_title')}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {t('dashboard.upload_payment_receipt_desc')}
            </p>
            <FileUploadCard
              type="payment"
              title={t('dashboard.file_payment')}
              description={t('dashboard.file_desc_img')}
              icon={ImageIcon}
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
              file={getFileByType('payment')}
              isUploading={uploadingType === 'payment'}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              t={t}
            />
          </div>
        </div>
      )}

      {/* Контакты */}
      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.contacts_label')}</h3>
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          {paymentInfo?.telegram_contact && (
            <a href={`https://t.me/${paymentInfo.telegram_contact.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-conference-blue-foreground transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              Telegram
            </a>
          )}
          {paymentInfo?.contact_phone && (
            <a href={`tel:${paymentInfo.contact_phone}`} className="flex items-center gap-2 hover:text-conference-blue-foreground transition-colors">
              <Phone className="h-4 w-4" />
              {paymentInfo.contact_phone}
            </a>
          )}
          {paymentInfo?.contact_email && (
            <a href={`mailto:${paymentInfo.contact_email}`} className="flex items-center gap-2 hover:text-conference-blue-foreground transition-colors">
              <Mail className="h-4 w-4" />
              {paymentInfo.contact_email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [paymentCalculation, setPaymentCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'payment'>('overview');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [settingsForm, setSettingsForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Состояние для управления платеными данными (только для админов)
  const [paymentInfoList, setPaymentInfoList] = useState<any[]>([]);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    card_number: '',
    card_holder: '',
    card_bank: '',
    amount_uzs: 200000,
    amount_usd: 20,
    contact_phone: '',
    contact_email: '',
    telegram_contact: '',
    description_uz: '',
    description_ru: '',
    is_active: true,
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const prevCardNumberRef = useRef<string | null>(null);

  const [form, setForm] = useState({
    direction: '',
    participation_format: '',
    is_foreign: false,
    affiliation: '',
    position: '',
    talk_type: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();

    // Обновляем данные об оплате каждые 30 секунд
    const interval = setInterval(async () => {
      try {
        const [paymentCalc, paymentInfoData] = await Promise.all([
          api.get('/api/payment-calculation', token!),
          api.get('/api/payment-info'),
        ]);

        // Проверяем, изменились ли данные карты
        if (prevCardNumberRef.current && paymentInfoData.card_number !== prevCardNumberRef.current) {
          toast.info('💳 Информация об оплате обновлена');
        }

        // Сохраняем текущий номер карты для сравнения
        prevCardNumberRef.current = paymentInfoData.card_number;

        setPaymentCalculation(paymentCalc);
        setPaymentInfo(paymentInfoData);
      } catch (err) {
        // Игнорируем ошибки фонового обновления
      }
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [token]);

  const fetchData = useCallback(async () => {
    try {
      const userData = await api.get('/api/me', token!);
      const appData = await api.get('/api/application', token!);

      setUser(userData);
      setApplication(appData);

      // Проверяем, является ли пользователь администратором
      if (userData?.is_staff) {
        setIsAdmin(true);
        // Загружаем все записи оплаты для админов
        try {
          const paymentList = await api.get('/api/admin/payment-info', token!);
          setPaymentInfoList(paymentList || []);
          if (paymentList && paymentList.length > 0) {
            const active = paymentList.find((p: any) => p.is_active) || paymentList[0];
            setSelectedPaymentInfo(active);
            setPaymentForm({
              card_number: active.card_number || '',
              card_holder: active.card_holder || '',
              card_bank: active.card_bank || '',
              amount_uzs: active.amount_uzs || 200000,
              amount_usd: active.amount_usd || 20,
              contact_phone: active.contact_phone || '',
              contact_email: active.contact_email || '',
              telegram_contact: active.telegram_contact || '',
              description_uz: active.description_uz || '',
              description_ru: active.description_ru || '',
              is_active: active.is_active ?? true,
            });
          }
        } catch (err) {
          console.log('Payment info admin not available');
        }
      }

      // Загружаем данные участника
      try {
        const participantData = await api.get('/api/participants/me', token!);
        if (participantData) {
          setParticipant(participantData);
          // Обновляем application файлами и статусом из participant
          setApplication((prev: any) => ({
            ...prev,
            status: participantData.status || prev?.status,  // Статус из Participant
            files: [
              participantData.has_article ? {
                id: 'article',
                type: 'article',
                original_name: participantData.article_file_url?.split('/').pop() || 'Статья',
                file_url: participantData.article_file_url || ''
              } : null,
              participantData.has_plagiarism ? {
                id: 'plagiarism',
                type: 'plagiarism',
                original_name: participantData.plagiarism_file_url?.split('/').pop() || 'Антиплагиат',
                file_url: participantData.plagiarism_file_url || ''
              } : null,
              participantData.payment_file_url ? {
                id: 'payment',
                type: 'payment',
                original_name: participantData.payment_file_url?.split('/').pop() || 'Чек',
                file_url: participantData.payment_file_url || ''
              } : null,
            ].filter(Boolean)
          }));
        }
      } catch (err) {
        // Participant ещё не создан
        console.log('Participant data not available');
      }

      // Загружаем информацию об оплате
      try {
        const [paymentCalc, paymentInfoData] = await Promise.all([
          api.get('/api/payment-calculation', token!),
          api.get('/api/payment-info'),
        ]);
        setPaymentCalculation(paymentCalc);
        setPaymentInfo(paymentInfoData);
      } catch (err) {
        console.log('Payment info not available');
      }

      if (userData) {
        setSettingsForm((prev) => ({
          ...prev,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          email: userData.email || '',
        }));
      }
      if (appData) {
        setForm({
          direction: appData.direction,
          participation_format: appData.participation_format,
          is_foreign: appData.is_foreign || false,
          affiliation: appData.affiliation || '',
          position: appData.position || '',
          talk_type: appData.talk_type || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSaveApplication = async () => {
    if (!form.direction || !form.participation_format || !form.affiliation || !form.position || !form.talk_type) {
      toast.error(t('dashboard.fill_all_fields'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/application', form, token!);
      toast.success(t('dashboard.save_success'));
      fetchData();
    } catch (err: any) {
      toast.error(t('dashboard.error_prefix') + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !application) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('application_id', application.id.toString());

    setUploadingType(type);
    try {
      toast.info(t('dashboard.file_uploading_toast'));
      await api.upload('/api/upload', formData, token!);
      toast.success(t('dashboard.file_upload_success'));

      // Перезагружаем данные чтобы обновить participant
      await fetchData();
    } catch (err: any) {
      toast.error(t('dashboard.file_upload_error_prefix') + err.message);
    } finally {
      setUploadingType(null);
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (!confirm(t('dashboard.delete_confirm'))) return;
    try {
      await api.delete(`/api/files/${fileId}`, token!);
      toast.success(t('dashboard.file_deleted'));
      fetchData();
    } catch (err: any) {
      toast.error(t('dashboard.file_delete_error_prefix') + err.message);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/api/profile', {
        full_name: settingsForm.full_name,
        phone: settingsForm.phone,
      }, token!);

      if (settingsForm.current_password || settingsForm.new_password || settingsForm.confirm_password) {
        if (!settingsForm.current_password || !settingsForm.new_password || !settingsForm.confirm_password) {
          toast.error(t('dashboard.fill_all_password_fields'));
          setSavingSettings(false);
          return;
        }
        if (settingsForm.new_password !== settingsForm.confirm_password) {
          toast.error(t('dashboard.passwords_not_match'));
          setSavingSettings(false);
          return;
        }
        await api.post('/api/change-password', {
          current_password: settingsForm.current_password,
          new_password: settingsForm.new_password,
        }, token!);
      }

      toast.success(t('dashboard.settings_saved'));
      setSettingsForm((prev) => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
      fetchData();
    } catch (err: any) {
      toast.error(t('dashboard.error_prefix') + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePaymentInfo = async () => {
    if (!selectedPaymentInfo?.id) {
      toast.error('Нет данных для сохранения');
      return;
    }
    setSavingPayment(true);
    try {
      const updated = await api.patch(`/api/admin/payment-info/${selectedPaymentInfo.id}`, paymentForm, token!);
      toast.success('✅ Платежные данные сохранены');
      setSelectedPaymentInfo(updated);

      // Обновляем paymentInfo и paymentCalculation
      try {
        const [paymentCalc, paymentInfoData] = await Promise.all([
          api.get('/api/payment-calculation', token!),
          api.get('/api/payment-info'),
        ]);
        setPaymentCalculation(paymentCalc);
        setPaymentInfo(paymentInfoData);
        toast.info('💳 Информация об оплате обновлена');
      } catch (err) {
        console.log('Payment info refresh failed');
      }

      fetchData();
    } catch (err: any) {
      toast.error('Ошибка сохранения: ' + err.message);
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-conference-accent border-t-transparent mb-4" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 rounded-none text-[10px] uppercase tracking-widest font-bold">
            <CheckCircle className="h-3 w-3 mr-1" /> {t('dashboard.status_approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 rounded-none text-[10px] uppercase tracking-widest font-bold">
            <XCircle className="h-3 w-3 mr-1" /> {t('dashboard.status_rejected')}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-none text-[10px] uppercase tracking-widest font-bold">
            <Clock className="h-3 w-3 mr-1" /> {t('dashboard.status_pending')}
          </Badge>
        );
    }
  };

  const getFileByType = (type: string) => application?.files?.find((f: any) => f.type === type);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-background">
      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'overview'
                ? 'text-conference-accent border-b-2 border-conference-accent bg-card/50'
                : 'text-muted-foreground'
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard.overview')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'settings'
                ? 'text-conference-accent border-b-2 border-conference-accent bg-card/50'
                : 'text-muted-foreground'
              }`}
          >
            <Settings className="h-4 w-4" />
            {t('dashboard.settings')}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'payment'
                  ? 'text-conference-accent border-b-2 border-conference-accent bg-card/50'
                  : 'text-muted-foreground'
                }`}
            >
              <DollarSign className="h-4 w-4" />
              Платежи
            </button>
          )}
        </div>
      </div>

      {/* Mobile Info Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3">
        <div className="flex gap-3 overflow-x-auto">
          {/* Статус заявки */}
          <div className="shrink-0 p-3 bg-muted rounded-lg min-w-[140px]">
            <p className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{t('dashboard.application_short')}</p>
            {application ? getStatusBadge(application.status) : <p className="text-[10px] italic text-muted-foreground">{t('dashboard.no_short')}</p>}
          </div>

          {/* Статус оплаты */}
          {application && (
            <div className={`shrink-0 p-3 rounded-lg min-w-[140px] ${participant?.payment_confirmed ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted'}`}>
              <p className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{t('dashboard.payment_short')}</p>
              {participant?.payment_confirmed ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-bold text-green-600">{t('dashboard.yes_short')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600">{t('dashboard.no_short')}</span>
                </div>
              )}
            </div>
          )}

          {/* Telegram Support */}
          {paymentInfo && (
            <a href={`https://t.me/${paymentInfo.telegram_contact?.replace('+', '')}`} target="_blank" rel="noreferrer" className="shrink-0 p-3 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center min-w-[48px]">
              <Smartphone className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-border flex-col bg-muted/30">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-conference-blue rounded-xl flex items-center justify-center text-white font-serif text-xl">
                {user?.full_name?.[0]}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-conference-blue-foreground truncate">{user?.full_name}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.participant')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: t('dashboard.overview'), tab: 'overview' as const },
              { icon: Settings, label: t('dashboard.settings'), tab: 'settings' as const },
              ...(isAdmin ? [{ icon: DollarSign, label: 'Платежные данные', tab: 'payment' as const }] : []),
            ].map((item, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => setActiveTab(item.tab)}
                className={`w-full justify-start gap-3 text-xs uppercase tracking-widest font-bold h-11 rounded-lg ${activeTab === item.tab
                    ? 'bg-card shadow-sm text-conference-accent'
                    : 'text-muted-foreground hover:text-conference-blue-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="p-6 border-t border-border space-y-3">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">{t('dashboard.application_status')}</p>
              {application ? getStatusBadge(application.status) : <p className="text-xs font-bold italic text-muted-foreground">{t('dashboard.no_application')}</p>}
            </div>

            {/* Статус оплаты */}
            {application && (
              <div className={`p-4 rounded-xl ${participant?.payment_confirmed ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted'}`}>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">{t('dashboard.payment_status_label')}</p>
                {participant?.payment_confirmed ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-green-600">{t('dashboard.payment_confirmed')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600">{t('dashboard.payment_not_confirmed')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10">
          {activeTab === 'overview' && (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <header className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-serif text-conference-blue-foreground mb-2">{t('dashboard.title')}</h1>
                <p className="text-muted-foreground text-sm font-light">{t('dashboard.subtitle')}</p>
              </header>

              {/* Mobile Status Badge */}
              <div className="sm:hidden p-3 bg-muted rounded-lg">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{t('dashboard.application_status')}</p>
                {application ? getStatusBadge(application.status) : <p className="text-xs font-bold italic text-muted-foreground">{t('dashboard.no_application')}</p>}
              </div>

              {/* Step 1: Application Form */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.step_1')}</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.application_params')}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Row 1: Direction & Format & Talk Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.direction_label')}</Label>
                      <Select
                        value={form.direction}
                        onValueChange={(v) => setForm({ ...form, direction: v })}
                        disabled={application?.status === 'approved'}
                      >
                        <SelectTrigger className="h-11 sm:h-12 rounded-lg border-border focus:ring-conference-accent bg-background text-sm">
                          <SelectValue placeholder={t('dashboard.direction_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={t('dashboard.direction_1')}>{t('dashboard.direction_1')}</SelectItem>
                          <SelectItem value={t('dashboard.direction_2')}>{t('dashboard.direction_2')}</SelectItem>
                          <SelectItem value={t('dashboard.direction_3')}>{t('dashboard.direction_3')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.format_label')}</Label>
                      <Select
                        value={form.participation_format}
                        onValueChange={(v) => setForm({ ...form, participation_format: v })}
                        disabled={application?.status === 'approved'}
                      >
                        <SelectTrigger className="h-11 sm:h-12 rounded-lg border-border focus:ring-conference-accent bg-background text-sm">
                          <SelectValue placeholder={t('dashboard.format_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offline">{t('dashboard.format_offline')}</SelectItem>
                          <SelectItem value="online">{t('dashboard.format_online')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.talk_type_label')}</Label>
                      <Select
                        value={form.talk_type}
                        onValueChange={(v) => setForm({ ...form, talk_type: v })}
                        disabled={application?.status === 'approved'}
                      >
                        <SelectTrigger className="h-11 sm:h-12 rounded-lg border-border focus:ring-conference-accent bg-background text-sm">
                          <SelectValue placeholder={t('dashboard.talk_type_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Plenary">{t('dashboard.talk_plenary')}</SelectItem>
                          <SelectItem value="Sectional">{t('dashboard.talk_section')}</SelectItem>
                          <SelectItem value="Panel">{t('dashboard.talk_panel')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Foreign Participant Toggle */}
                  <div className="p-4 border border-border bg-card rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_foreign}
                        onChange={(e) => setForm({ ...form, is_foreign: e.target.checked })}
                        disabled={application?.status === 'approved'}
                        className="w-5 h-5 rounded border-border text-conference-accent focus:ring-conference-accent disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm font-bold text-conference-blue-foreground">{t('dashboard.is_foreign_label')}</span>
                        <p className="text-xs text-muted-foreground">{t('dashboard.is_foreign_desc')}</p>
                      </div>
                    </label>
                  </div>

                  {/* Row 2: Affiliation & Position */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.affiliation_label')}</Label>
                      <input
                        type="text"
                        value={form.affiliation}
                        onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                        disabled={application?.status === 'approved'}
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors disabled:opacity-50"
                        placeholder={t('dashboard.affiliation_placeholder')}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.position_label')}</Label>
                      <Select
                        value={form.position}
                        onValueChange={(v) => setForm({ ...form, position: v })}
                        disabled={application?.status === 'approved'}
                      >
                        <SelectTrigger className="h-11 sm:h-12 rounded-lg border-border focus:ring-conference-accent bg-background text-sm">
                          <SelectValue placeholder={t('dashboard.position_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professor">{t('dashboard.position_professor')}</SelectItem>
                          <SelectItem value="Associate Professor">{t('dashboard.position_associate')}</SelectItem>
                          <SelectItem value="Assistant Professor">{t('dashboard.position_assistant')}</SelectItem>
                          <SelectItem value="PhD Student">{t('dashboard.position_phd')}</SelectItem>
                          <SelectItem value="Researcher">{t('dashboard.position_researcher')}</SelectItem>
                          <SelectItem value="Lecturer">{t('dashboard.position_lecturer')}</SelectItem>
                          <SelectItem value="Undergraduate Student">{t('dashboard.position_undergrad')}</SelectItem>
                          <SelectItem value="Other">{t('dashboard.position_other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveApplication}
                  disabled={submitting || application?.status === 'approved'}
                  className="w-full sm:w-auto bg-conference-blue hover:bg-conference-accent text-white h-11 sm:h-12 px-6 sm:px-8 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all"
                >
                  {application ? t('dashboard.save_changes') : t('dashboard.create_application')}
                </Button>
              </section>

              {/* Step 2: File Uploads */}
              {application && (
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.step_2')}</span>
                    <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.file_uploads')}</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FileUploadCard
                      type="article"
                      title={t('dashboard.file_article')}
                      description={t('dashboard.file_desc_pdf')}
                      icon={FileText}
                      accept=".doc,.docx,.txt,.rtf"
                      file={getFileByType('article')}
                      isUploading={uploadingType === 'article'}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      t={t}
                    />

                    <FileUploadCard
                      type="plagiarism"
                      title={t('dashboard.file_plagiarism')}
                      description={t('dashboard.file_desc_pdf')}
                      icon={ShieldCheck}
                      accept=".doc,.docx,.txt,.rtf"
                      file={getFileByType('plagiarism')}
                      isUploading={uploadingType === 'plagiarism'}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      t={t}
                    />
                  </div>
                </section>
              )}

              {/* Step 3: Payment */}
              {application && paymentCalculation && paymentInfo && (
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.step_3') || 'Шаг 3'}</span>
                    <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.payment_title')}</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <PaymentCard
                    paymentInfo={paymentInfo}
                    amount={paymentCalculation.amount || 0}
                    currency={paymentCalculation.currency || 'UZS'}
                    shouldPay={paymentCalculation.should_pay || false}
                    message={paymentCalculation.message || ''}
                    paymentConfirmed={participant?.payment_confirmed || false}
                    getFileByType={getFileByType}
                    handleFileUpload={handleFileUpload}
                    handleFileDelete={handleFileDelete}
                    uploadingType={uploadingType}
                    t={t}
                  />

                  {/* Статус подтверждения оплаты */}
                  {participant?.payment_confirmed && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-600">{t('dashboard.payment_confirmed_by_organizer')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.payment_confirmed_desc')}</p>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            /* Settings Tab */
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <header className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-serif text-conference-blue-foreground mb-2">{t('dashboard.account_settings')}</h1>
                <p className="text-muted-foreground text-sm font-light">{t('dashboard.account_settings_subtitle')}</p>
              </header>

              {/* Profile Settings */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.profile')}</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.personal_data')}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.name_label')}</Label>
                    <input
                      type="text"
                      value={settingsForm.full_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, full_name: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder={t('dashboard.name_placeholder')}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.email_label')}</Label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      disabled
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted-foreground">{t('dashboard.email_note')}</p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.phone_label')}</Label>
                    <input
                      type="tel"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder={t('dashboard.phone_placeholder')}
                    />
                  </div>
                </div>
              </section>

              {/* Password Change */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.security')}</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">{t('dashboard.change_password')}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.current_password_label')}</Label>
                    <input
                      type="password"
                      value={settingsForm.current_password}
                      onChange={(e) => setSettingsForm({ ...settingsForm, current_password: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder={t('dashboard.current_password_placeholder')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.new_password_label')}</Label>
                      <input
                        type="password"
                        value={settingsForm.new_password}
                        onChange={(e) => setSettingsForm({ ...settingsForm, new_password: e.target.value })}
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                        placeholder={t('dashboard.new_password_placeholder')}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.confirm_password_label')}</Label>
                      <input
                        type="password"
                        value={settingsForm.confirm_password}
                        onChange={(e) => setSettingsForm({ ...settingsForm, confirm_password: e.target.value })}
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                        placeholder={t('dashboard.confirm_password_placeholder')}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full sm:w-auto bg-conference-blue hover:bg-conference-accent text-white"
              >
                {savingSettings ? t('dashboard.saving') : t('dashboard.save_settings')}
              </Button>
            </div>
          )}

          {activeTab === 'payment' && isAdmin && (
            /* Payment Info Tab (Admin Only) */
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <header className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-serif text-conference-blue-foreground mb-2">Платежные данные</h1>
                <p className="text-muted-foreground text-sm font-light">Управление реквизитами для оплаты участниками</p>
              </header>

              {/* Выбор записи */}
              {paymentInfoList.length > 1 && (
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">Выбор</span>
                    <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">Записи оплаты</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {paymentInfoList.map((pi: any) => (
                      <button
                        key={pi.id}
                        onClick={() => {
                          setSelectedPaymentInfo(pi);
                          setPaymentForm({
                            card_number: pi.card_number || '',
                            card_holder: pi.card_holder || '',
                            card_bank: pi.card_bank || '',
                            amount_uzs: pi.amount_uzs || 200000,
                            amount_usd: pi.amount_usd || 20,
                            contact_phone: pi.contact_phone || '',
                            contact_email: pi.contact_email || '',
                            telegram_contact: pi.telegram_contact || '',
                            description_uz: pi.description_uz || '',
                            description_ru: pi.description_ru || '',
                            is_active: pi.is_active ?? true,
                          });
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${selectedPaymentInfo?.id === pi.id
                            ? 'bg-conference-accent text-white'
                            : 'bg-muted text-muted-foreground hover:bg-card'
                          }`}
                      >
                        {pi.card_bank} - {pi.card_number?.slice(-4)}
                        {!pi.is_active && ' (неакт.)'}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Форма платежных данных */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">Данные карты</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">Реквизиты</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Карта предпросмотра */}
                <div className="p-6 bg-gradient-to-br from-conference-blue to-conference-blue-deep text-white rounded-xl shadow-lg max-w-md">
                  <div className="flex justify-between items-start mb-8">
                    <CreditCard className="h-8 w-8 opacity-80" />
                    <span className="text-xs font-bold opacity-60">{paymentForm.card_bank}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-2xl font-mono tracking-widest">{paymentForm.card_number || '•••• •••• •••• ••••'}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Владелец</p>
                      <p className="text-sm font-bold uppercase">{paymentForm.card_holder || 'НЕ УКАЗАН'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Номер карты</Label>
                    <input
                      type="text"
                      value={paymentForm.card_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, card_number: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="8600 0000 0000 0000"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Владелец карты</Label>
                    <input
                      type="text"
                      value={paymentForm.card_holder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, card_holder: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="WICAR CONFERENCE"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Банк</Label>
                    <input
                      type="text"
                      value={paymentForm.card_bank}
                      onChange={(e) => setPaymentForm({ ...paymentForm, card_bank: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="Uzum Bank"
                    />
                  </div>
                </div>
              </section>

              {/* Суммы */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">Суммы</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">Стоимость участия</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Сумма UZS (узбекистанские участники)</Label>
                    <input
                      type="number"
                      value={paymentForm.amount_uzs}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount_uzs: parseInt(e.target.value) || 0 })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="200000"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Сумма USD (иностранные участники)</Label>
                    <input
                      type="number"
                      value={paymentForm.amount_usd}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount_usd: parseInt(e.target.value) || 0 })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="20"
                    />
                  </div>
                </div>
              </section>

              {/* Контакты */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">Контакты</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">Контактная информация</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Телефон</Label>
                    <input
                      type="text"
                      value={paymentForm.contact_phone}
                      onChange={(e) => setPaymentForm({ ...paymentForm, contact_phone: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="+998 90 985 80 44"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email</Label>
                    <input
                      type="email"
                      value={paymentForm.contact_email}
                      onChange={(e) => setPaymentForm({ ...paymentForm, contact_email: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="conference@wicar.uz"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Telegram</Label>
                    <input
                      type="text"
                      value={paymentForm.telegram_contact}
                      onChange={(e) => setPaymentForm({ ...paymentForm, telegram_contact: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder="+998 90 985 80 44"
                    />
                  </div>
                </div>
              </section>

              {/* Описания */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">Описания</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-conference-blue-foreground">Тексты для участников</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Описание на узбекском</Label>
                    <textarea
                      value={paymentForm.description_uz}
                      onChange={(e) => setPaymentForm({ ...paymentForm, description_uz: e.target.value })}
                      className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors resize-y"
                      placeholder="Tavsif..."
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Описание на русском</Label>
                    <textarea
                      value={paymentForm.description_ru}
                      onChange={(e) => setPaymentForm({ ...paymentForm, description_ru: e.target.value })}
                      className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-border bg-background text-conference-blue-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors resize-y"
                      placeholder="Описание..."
                    />
                  </div>
                </div>
              </section>

              {/* Активность */}
              <section className="space-y-4 sm:space-y-6">
                <div className="p-4 border border-border bg-card rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentForm.is_active}
                      onChange={(e) => setPaymentForm({ ...paymentForm, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-conference-accent focus:ring-conference-accent"
                    />
                    <div>
                      <span className="text-sm font-bold text-conference-blue-foreground">Активная запись</span>
                      <p className="text-xs text-muted-foreground">Только активная запись используется для отображения участникам</p>
                    </div>
                  </label>
                </div>
              </section>

              <Button
                onClick={handleSavePaymentInfo}
                disabled={savingPayment}
                className="w-full sm:w-auto bg-conference-blue hover:bg-conference-accent text-white h-11 sm:h-12 px-6 sm:px-8 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all"
              >
                {savingPayment ? 'Сохранение...' : 'Сохранить платежные данные'}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
