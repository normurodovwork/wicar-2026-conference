import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';
import { UserPlus, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const REGISTRATION_DEADLINE = new Date('2026-05-15T23:59:59');
  const isRegistrationClosed = new Date() > REGISTRATION_DEADLINE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistrationClosed) {
      toast.error(t('auth.registration_closed'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/register', formData);
      toast.success(t('auth.register_success'));
      navigate('/login');
    } catch (err: any) {
      toast.error(t('auth.register_error') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16 pt-20">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 border border-border shadow-2xl overflow-hidden">
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-conference-blue text-white border-r border-border relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-conference-accent mb-8">WICAR 2026 / Registration</div>
            <h2 className="text-5xl font-serif leading-tight text-white mb-6">
              {t('register.title').split(' ')[0]} <br />
              <span className="text-conference-accent italic">{t('register.title').split(' ').slice(1, 3).join(' ')}</span> <br />
              {t('register.title').split(' ').slice(3).join(' ')}
            </h2>
            <div className="space-y-6 mt-12">
              {[
                { title: t('register.publications'), desc: t('register.publications_desc') },
                { title: t('register.networking'), desc: t('register.networking_desc') },
                { title: t('register.certification'), desc: t('register.certification_desc') },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-px h-12 bg-conference-accent opacity-30" />
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-white/60 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/60">
              {t('register.deadline')}
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-16 bg-card flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-8">
            <header>
              <h1 className="text-2xl font-bold text-conference-blue-foreground uppercase tracking-widest mb-2">{t('auth.register')}</h1>
              <div className="h-1 w-12 bg-conference-accent" />
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.full_name_label')}</Label>
                  <Input
                    id="full_name"
                    placeholder={t('auth.full_name_placeholder')}
                    className="h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.email_label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.email_placeholder')}
                    className="h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.phone_label')}</Label>
                  <Input
                    id="phone"
                    placeholder={t('auth.phone_placeholder')}
                    className="h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.password_label')}</Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-conference-blue hover:bg-conference-accent text-white h-12 rounded-none text-xs uppercase tracking-widest font-bold transition-all group mt-6" disabled={loading || isRegistrationClosed}>
                {isRegistrationClosed ? t('auth.registration_closed') : (loading ? t('auth.creating_account') : (
                  <>
                    {t('auth.register')}
                    <ArrowRight className="ml-2 h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                ))}
              </Button>
            </form>

            <div className="pt-8 border-t border-border text-center">
              <p className="text-xs text-muted-foreground font-light">
                {t('auth.already_registered')}{' '}
                <Link to="/login" className="text-conference-accent font-bold uppercase tracking-widest hover:underline ml-2">
                  {t('auth.login_link')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
