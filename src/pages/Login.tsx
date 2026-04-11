import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/src/components/LanguageProvider';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/api/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(t('auth.login_success'));
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      toast.error(t('auth.login_error') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16 sm:pt-20">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 border border-border shadow-2xl overflow-hidden">
        {/* Left Side - Visual/Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-conference-blue text-conference-blue-foreground relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-mono uppercase tracking-[0.3em] opacity-60 mb-8">WICAR 2026 / Auth</div>
            <h2 className="text-5xl font-serif leading-tight mb-8">
              {t('login.title').split(' ')[0]} <br />
              <span className="text-conference-accent italic">{t('login.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-conference-blue-foreground/70 font-light leading-relaxed max-w-sm">
              {t('login.subtitle')}
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest opacity-40">
              <span>{t('login.secure_access')}</span>
              <div className="h-px w-12 bg-white opacity-20" />
              <span>{t('login.location')}</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-conference-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48" />
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-16 bg-card flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-8">
            <header>
              <h1 className="text-2xl font-bold text-foreground uppercase tracking-widest mb-2">{t('nav.login')}</h1>
              <div className="h-1 w-12 bg-conference-accent" />
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.email_label')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.email_placeholder')}
                      className="pl-10 h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('auth.password_label')}</Label>
                    <Link to="#" className="text-[10px] uppercase tracking-widest font-bold text-conference-accent hover:underline">{t('auth.forgot')}</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10 h-12 rounded-none border-border focus:ring-conference-accent bg-background"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-conference-blue hover:bg-conference-accent text-conference-blue-foreground h-12 rounded-none text-xs uppercase tracking-widest font-bold transition-all group" disabled={loading}>
                {loading ? t('auth.processing') : (
                  <>
                    {t('auth.login')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-8 border-t border-border text-center">
              <p className="text-xs text-muted-foreground font-light">
                {t('auth.not_registered')}{' '}
                <Link to="/register" className="text-conference-accent font-bold uppercase tracking-widest hover:underline ml-2">
                  {t('auth.register_link')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
