import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/src/components/LanguageProvider';
import { FileText, CheckCircle, Clock, XCircle, LayoutDashboard, Settings, Image as ImageIcon, ShieldCheck, Download, Trash2, CreditCard, Smartphone, Mail, Phone } from 'lucide-react';

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
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm">{title}</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {file && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />}
    </div>

    {file ? (
      <div className="flex items-center gap-2 sm:gap-3 pt-3 border-t border-border">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{file.original_name}</p>
          <p className="text-[10px] text-muted-foreground">{t('dashboard.file_uploaded')}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground" asChild>
            <a href={file.file_url} target="_blank" rel="noreferrer">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          </Button>
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
const PaymentCard = ({ paymentInfo, amount, currency, shouldPay, message, paymentConfirmed }: { paymentInfo: any, amount: number, currency: string, shouldPay: boolean, message: string, paymentConfirmed?: boolean }) => (
  <div className="p-6 border border-border bg-gradient-to-br from-card to-muted/30 space-y-6 rounded-xl">
    {/* Статус подтверждения */}
    {paymentConfirmed && (
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        <p className="text-xs font-bold text-green-600">Оплата подтверждена организатором</p>
      </div>
    )}
    
    {/* Сумма оплаты */}
    <div className={`p-4 rounded-lg ${shouldPay ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Сумма оплаты</p>
          {shouldPay && amount > 0 ? (
            <p className="text-3xl font-bold text-green-600">
              {amount.toLocaleString()} <span className="text-lg">{currency}</span>
            </p>
          ) : (
            <p className="text-lg font-bold text-amber-600">Не требуется оплата</p>
          )}
        </div>
        {shouldPay && amount > 0 && <CheckCircle className="h-8 w-8 text-green-500" />}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{message}</p>
    </div>

    {/* Карта */}
    {shouldPay && amount > 0 && (
      <>
        <div className="p-6 bg-gradient-to-br from-conference-blue to-conference-blue-deep text-white rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <CreditCard className="h-8 w-8 opacity-80" />
            <span className="text-xs font-bold opacity-60">{paymentInfo.card_bank}</span>
          </div>
          <div className="mb-6">
            <p className="text-2xl font-mono tracking-widest">{paymentInfo.card_number}</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Владелец карты</p>
              <p className="text-sm font-bold uppercase">{paymentInfo.card_holder}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Сумма</p>
              <p className="text-xl font-bold">{amount.toLocaleString()} {currency}</p>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

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
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
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
  }, [token]);

  const fetchData = useCallback(async () => {
    try {
      const userData = await api.get('/api/me', token!);
      const appData = await api.get('/api/application', token!);
      
      setUser(userData);
      setApplication(appData);
      
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
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${
              activeTab === 'overview'
                ? 'text-conference-accent border-b-2 border-conference-accent bg-card/50'
                : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard.overview')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${
              activeTab === 'settings'
                ? 'text-conference-accent border-b-2 border-conference-accent bg-card/50'
                : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            {t('dashboard.settings')}
          </button>
        </div>
      </div>

      {/* Mobile Info Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3">
        <div className="flex gap-3 overflow-x-auto">
          {/* Статус заявки */}
          <div className="shrink-0 p-3 bg-muted rounded-lg min-w-[140px]">
            <p className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Заявка</p>
            {application ? getStatusBadge(application.status) : <p className="text-[10px] italic text-muted-foreground">Нет</p>}
          </div>
          
          {/* Статус оплаты */}
          {application && (
            <div className={`shrink-0 p-3 rounded-lg min-w-[140px] ${participant?.payment_confirmed ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted'}`}>
              <p className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Оплата</p>
              {participant?.payment_confirmed ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-bold text-green-600">Да</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600">Нет</span>
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
              <div className="w-12 h-12 bg-conference-blue rounded-xl flex items-center justify-center text-conference-blue-foreground font-serif text-xl">
                {user?.full_name?.[0]}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{user?.full_name}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.participant')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: t('dashboard.overview'), tab: 'overview' as const },
              { icon: Settings, label: t('dashboard.settings'), tab: 'settings' as const },
            ].map((item, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => setActiveTab(item.tab)}
                className={`w-full justify-start gap-3 text-xs uppercase tracking-widest font-bold h-11 rounded-lg ${
                  activeTab === item.tab
                    ? 'bg-card shadow-sm text-conference-accent'
                    : 'text-muted-foreground hover:text-foreground'
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
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Статус оплаты</p>
                {participant?.payment_confirmed ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-green-600">Подтверждена</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600">Не подтверждена</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Инструкция */}
            <div className="p-4 bg-muted/50 rounded-xl space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.instructions')}</p>
              <ol className="space-y-1.5 text-[10px] text-muted-foreground">
                <li><strong className="text-foreground">1.</strong> {t('dashboard.instr_1')}</li>
                <li><strong className="text-foreground">2.</strong> {t('dashboard.instr_2')}</li>
                <li><strong className="text-foreground">3.</strong> {t('dashboard.instr_3')}</li>
                <li><strong className="text-foreground">4.</strong> {t('dashboard.instr_4')}</li>
                <li><strong className="text-foreground">5.</strong> {t('dashboard.instr_5')}</li>
                <li><strong className="text-foreground">6.</strong> {t('dashboard.instr_6')}</li>
              </ol>
            </div>

            {/* Контакты */}
            {paymentInfo && (
              <div className="p-4 border-t border-border bg-muted/30 rounded-b-xl space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Контакты</p>
                <div className="space-y-2">
                  <a href={`https://t.me/${paymentInfo.telegram_contact?.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Smartphone className="h-3.5 w-3.5" />
                    Telegram
                  </a>
                  <a href={`tel:${paymentInfo.contact_phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    {paymentInfo.contact_phone}
                  </a>
                  <a href={`mailto:${paymentInfo.contact_email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10">
          {activeTab === 'overview' ? (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <header className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">{t('dashboard.title')}</h1>
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
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-foreground">{t('dashboard.application_params')}</h2>
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
                        <span className="text-sm font-bold text-foreground">{t('dashboard.is_foreign_label')}</span>
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
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors disabled:opacity-50"
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
                  className="w-full sm:w-auto bg-conference-blue hover:bg-conference-accent text-conference-blue-foreground h-11 sm:h-12 px-6 sm:px-8 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all"
                >
                  {application ? t('dashboard.save_changes') : t('dashboard.create_application')}
                </Button>
              </section>

              {/* Step 2: File Uploads */}
              {application && (
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.step_2')}</span>
                    <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-foreground">{t('dashboard.file_uploads')}</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FileUploadCard
                      type="article"
                      title={t('dashboard.file_article')}
                      description={t('dashboard.file_desc_pdf')}
                      icon={FileText}
                      accept=".pdf,.doc,.docx,.txt,.rtf"
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
                      accept=".pdf,.doc,.docx,.txt,.rtf"
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
                    <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-foreground">Оплата</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <PaymentCard
                    paymentInfo={paymentInfo}
                    amount={paymentCalculation.amount || 0}
                    currency={paymentCalculation.currency || 'UZS'}
                    shouldPay={paymentCalculation.should_pay || false}
                    message={paymentCalculation.message || ''}
                    paymentConfirmed={participant?.payment_confirmed || false}
                  />

                  {/* Статус подтверждения оплаты */}
                  {participant?.payment_confirmed && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-600">Оплата подтверждена организатором</p>
                        <p className="text-xs text-muted-foreground">Ваш организационный взнос успешно подтверждён</p>
                      </div>
                    </div>
                  )}

                  {/* Загрузка чека */}
                  {paymentCalculation.should_pay && paymentCalculation.amount > 0 && (
                    <div className="p-6 border border-border bg-card rounded-xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Загрузить чек об оплате
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        После перевода средств загрузите скриншот или фото чека для подтверждения оплаты
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
                  )}
                </section>
              )}

              {/* Info Panel - удалён, перенесён в sidebar */}
            </div>
          ) : (
            /* Settings Tab */
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <header className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">{t('dashboard.account_settings')}</h1>
                <p className="text-muted-foreground text-sm font-light">{t('dashboard.account_settings_subtitle')}</p>
              </header>

              {/* Profile Settings */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.profile')}</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-foreground">{t('dashboard.personal_data')}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.name_label')}</Label>
                    <input
                      type="text"
                      value={settingsForm.full_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, full_name: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
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
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                      placeholder={t('dashboard.phone_placeholder')}
                    />
                  </div>
                </div>
              </section>

              {/* Password Change */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs font-mono text-conference-accent font-bold">{t('dashboard.security')}</span>
                  <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-foreground">{t('dashboard.change_password')}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.current_password_label')}</Label>
                    <input
                      type="password"
                      value={settingsForm.current_password}
                      onChange={(e) => setSettingsForm({ ...settingsForm, current_password: e.target.value })}
                      className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
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
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                        placeholder={t('dashboard.new_password_placeholder')}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('dashboard.confirm_password_label')}</Label>
                      <input
                        type="password"
                        value={settingsForm.confirm_password}
                        onChange={(e) => setSettingsForm({ ...settingsForm, confirm_password: e.target.value })}
                        className="w-full h-11 sm:h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-conference-accent transition-colors"
                        placeholder={t('dashboard.confirm_password_placeholder')}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full sm:w-auto bg-conference-blue hover:bg-conference-accent text-conference-blue-foreground h-11 sm:h-12 px-6 sm:px-8 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all"
              >
                {savingSettings ? t('dashboard.saving') : t('dashboard.save_settings')}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
