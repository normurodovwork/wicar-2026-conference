import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { User, LogOut, Menu, Moon, Sun, Languages, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from './LanguageProvider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
            <div className="p-0 transition-colors">
              <img src="/img/logo_new.png" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full" />
            </div>
            <span className="font-serif text-lg sm:text-2xl font-semibold tracking-tight text-conference-blue-foreground">WICAR 2026</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              { key: 'nav.about', href: '#about' },
              { key: 'nav.directions', href: '#directions' },
              { key: 'nav.dates', href: '#dates' },
              { key: 'nav.requirements', href: '#requirements' }
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    const el = document.querySelector(item.href);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className={`text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground hover:text-conference-accent transition-colors ${language === 'uz' ? 'text-[10px]' : ''}`}
              >
                {t(item.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground h-9 w-9 sm:h-10 sm:w-10")}>
                <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('uz')}>
                  {t('navbar.lang_uz')} {language === 'uz' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')}>
                  {t('navbar.lang_ru')} {language === 'ru' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  {t('navbar.lang_en')} {language === 'en' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground h-9 w-9 sm:h-10 sm:w-10"
            >
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {token ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-conference-blue-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-bold">{user?.full_name?.split(' ')[0]}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={cn(buttonVariants({ variant: "ghost" }), "text-xs uppercase tracking-widest font-bold text-conference-blue-foreground")}
                >
                  {t('nav.login')}
                </Link>
              )}

              <Link
                to={token ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ variant: "default" }), `bg-conference-blue hover:bg-conference-accent text-white px-6 sm:px-8 rounded-full ${language === 'uz' ? 'text-[9px]' : 'text-xs'} uppercase tracking-widest font-bold transition-all shadow-lg shadow-conference-blue/10`)}
              >
                {token ? t('navbar.cabinet') : t('nav.apply')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            {[
              { key: 'nav.about', href: '#about' },
              { key: 'nav.directions', href: '#directions' },
              { key: 'nav.dates', href: '#dates' },
              { key: 'nav.requirements', href: '#requirements' }
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={`block uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:text-conference-accent transition-colors py-2 ${language === 'uz' ? 'text-xs' : 'text-sm'}`}
              >
                {t(item.key)}
              </a>
            ))}

            <div className="pt-2 border-t border-border space-y-2">
              {token ? (
                <Button
                  variant="outline"
                  className={`w-full ${language === 'uz' ? 'text-[9px]' : 'text-xs'} uppercase tracking-widest font-bold`}
                  onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navbar.logout')}
                  </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }), `w-full ${language === 'uz' ? 'text-[9px]' : 'text-xs'} uppercase tracking-widest font-bold`)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(buttonVariants({ variant: "default" }), `w-full bg-conference-blue hover:bg-conference-accent text-white ${language === 'uz' ? 'text-[9px]' : 'text-xs'} uppercase tracking-widest font-bold`)}
                  >
                    {t('nav.apply')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
