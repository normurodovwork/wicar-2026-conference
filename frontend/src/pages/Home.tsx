import { motion, useScroll, useTransform } from 'motion/react';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useLanguage } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';
import {
  FileText, Calendar, MapPin, Users, ArrowRight, Download,
  Globe, Shield, Zap, Mail, Phone, MapPinned, Languages, Type, Image,
  FileStack, CreditCard, ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
  Building2, BookOpen, CalendarDays, MessageSquare, ClipboardList,
  Waves, BarChart2, Leaf, Send, UserCheck, LayoutList, Star, BookMarked
} from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

const Countdown = ({ deadline }: { deadline: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const target = new Date(deadline).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center mt-3 sm:mt-6 mb-4 sm:mb-8">
      {[
        { label: t('countdown.days'), value: timeLeft.days },
        { label: t('countdown.hours'), value: timeLeft.hours },
        { label: t('countdown.mins'), value: timeLeft.minutes },
        { label: t('countdown.secs'), value: timeLeft.seconds }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="text-lg sm:text-2xl md:text-4xl font-serif font-light text-conference-accent mb-0.5 sm:mb-1">
            {item.value.toString().padStart(2, '0')}
          </div>
          <div className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const AccordionItem = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => (
  <div className="border border-border bg-card overflow-hidden transition-all duration-300">
    <button
      onClick={onClick}
      className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-accent/50 transition-colors"
    >
      <span className="text-sm font-bold uppercase tracking-widest text-conference-blue-foreground">{title}</span>
      {isOpen ? <ChevronUp className="h-5 w-5 text-conference-accent" /> : <ChevronDown className="h-5 w-5 text-conference-accent" />}
    </button>
    <div className={cn(
      "px-8 transition-all duration-500 ease-in-out",
      isOpen ? "max-h-[1000px] py-6 opacity-100" : "max-h-0 py-0 opacity-0"
    )}>
      <div className="text-conference-blue-foreground/80 font-light leading-relaxed text-sm">
        {children}
      </div>
    </div>
  </div>
);

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [conferenceFiles, setConferenceFiles] = useState<any>({});
  const [committees, setCommittees] = useState<any[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Загрузка комитетов из API
  useEffect(() => {
    const fetchCommitеты = async () => {
      try {
        const data = await api.get('/api/committees');
        setCommittees(data);
      } catch (err) {
        console.error('Failed to fetch committees:', err);
      } finally {
        setLoadingCommittees(false);
      }
    };
    fetchCommitеты();
  }, []);

  // Загрузка файлов конференции из API
  useEffect(() => {
    const fetchConferenceFiles = async () => {
      try {
        const data = await api.get('/api/conference-files');
        const filesMap: any = {};
        data.forEach((file: any) => {
          filesMap[file.file_type] = file;
        });
        setConferenceFiles(filesMap);
      } catch (err) {
        console.error('Failed to fetch conference files:', err);
      }
    };
    fetchConferenceFiles();
  }, []);

  return (
    <div className="bg-background">
      <SeoHead />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center pt-14 sm:pt-16 overflow-hidden text-center bg-background">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
          {/* Баннер по теме: светлый — в светлой, тёмный — в тёмной */}
          <img
            src="/img/Light_bg_banner.png"
            alt="WICAR 2026 banner"
            className="w-full h-full object-cover scale-110 block dark:hidden"
          />
          <img
            src="/img/Dark_bg_banner.png"
            alt="WICAR 2026 banner"
            className="w-full h-full object-cover scale-110 hidden dark:block"
          />
          {/* Лёгкое покрытие для читаемости текста */}
          <div className="absolute inset-0 bg-white/30 dark:bg-background/40" />
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-30">
          <motion.div
            style={{ y: contentY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-tight text-conference-blue-foreground mb-2 sm:mb-4">
              {t('hero.title')}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 sm:mb-8 text-xs sm:text-sm uppercase tracking-widest font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-conference-accent" />
                {t('hero.date')}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-conference-accent" />
                {t('hero.location')}
              </div>
            </div>

            <p className="text-base sm:text-xl text-muted-foreground mb-3 sm:mb-4 max-w-2xl mx-auto leading-relaxed font-light">
              {t('hero.subtitle')}
            </p>

            <div className="mt-4 sm:mt-8">
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1 sm:mb-2">{t('hero.countdown.title')}</p>
              <Countdown deadline="2026-05-10T23:59:59" />
            </div>

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center items-center">
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  className={cn(buttonVariants({ size: "lg" }), "bg-conference-blue hover:bg-conference-accent text-white px-6 sm:px-10 h-11 sm:h-14 rounded-none text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all shadow-2xl shadow-conference-blue/20 w-full sm:w-auto")}
                >
                  {t('nav.apply')} <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </a>

                {conferenceFiles['program']?.file_url && (
                  <a
                    href={conferenceFiles['program'].file_url}
                    download={conferenceFiles['program'].file_name || "conference_program.pdf"}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-conference-accent text-conference-accent hover:bg-conference-accent hover:text-conference-blue-foreground px-6 sm:px-10 h-11 sm:h-14 rounded-none text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all w-full sm:w-auto"
                    )}
                  >
                    <Download className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t('hero.download.program')}
                  </a>
                )}

                {conferenceFiles['gallery']?.gallery_url && (
                  <a
                    href={conferenceFiles['gallery'].gallery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-conference-accent text-conference-accent hover:bg-conference-accent hover:text-conference-blue-foreground px-6 sm:px-10 h-11 sm:h-14 rounded-none text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all w-full sm:w-auto"
                    )}
                  >
                    <Image className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t('hero.download.gallery')}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {conferenceFiles['info_letter_1']?.file_url && (
                  <a
                    href={conferenceFiles['info_letter_1'].file_url}
                    download={conferenceFiles['info_letter_1'].file_name || "info_letter_1.pdf"}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-conference-blue text-conference-blue-foreground dark:border-conference-accent dark:text-conference-accent hover:bg-conference-blue hover:text-conference-blue-foreground dark:hover:bg-conference-accent px-3 sm:px-5 h-8 sm:h-10 rounded-none text-[8px] sm:text-[9px] uppercase tracking-widest font-bold transition-all"
                    )}
                  >
                    <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t('hero.download.info1')}
                  </a>
                )}
                {conferenceFiles['info_letter_2']?.file_url && (
                  <a
                    href={conferenceFiles['info_letter_2'].file_url}
                    download={conferenceFiles['info_letter_2'].file_name || "info_letter_2.pdf"}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-conference-blue text-conference-blue-foreground dark:border-conference-accent dark:text-conference-accent hover:bg-conference-blue hover:text-conference-blue-foreground dark:hover:bg-conference-accent px-3 sm:px-5 h-8 sm:h-10 rounded-none text-[8px] sm:text-[9px] uppercase tracking-widest font-bold transition-all"
                    )}
                  >
                    <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t('hero.download.info2')}
                  </a>
                )}
                {/* Сборник: прямая ссылка на загруженный PDF (приоритет — файл из админки) */}
                <a
                  href={conferenceFiles['collection']?.file_url || '/files/CONF_WICAR17.05.2026.pdf'}
                  download={conferenceFiles['collection']?.file_name || 'CONF_WICAR_2026.pdf'}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-conference-blue text-conference-blue-foreground dark:border-conference-accent dark:text-conference-accent hover:bg-conference-blue hover:text-conference-blue-foreground dark:hover:bg-conference-accent px-3 sm:px-5 h-8 sm:h-10 rounded-none text-[8px] sm:text-[9px] uppercase tracking-widest font-bold transition-all"
                  )}
                >
                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t('hero.download.collection_btn')}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Waves */}
        <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg className="relative block w-[200%] h-16 md:h-24 animate-wave" viewBox="0 0 2400 120" preserveAspectRatio="none">
            <path d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 C1400,20 1600,100 1800,60 C2000,20 2200,100 2400,60 L2400,120 L0,120 Z" className="fill-conference-blue opacity-40"></path>
          </svg>
          <svg className="absolute bottom-0 left-0 block w-[200%] h-12 md:h-20 animate-wave-slow" viewBox="0 0 2400 120" preserveAspectRatio="none">
            <path d="M0,70 C150,40 350,100 600,70 C850,40 1050,100 1200,70 C1350,40 1550,100 1800,70 C2050,40 2250,100 2400,70 L2400,120 L0,120 Z" className="fill-conference-blue opacity-60"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center justify-center p-3 bg-conference-accent/10 rounded-full mb-8">
              <Zap className="h-6 w-6 text-conference-accent" />
            </div>
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-conference-accent mb-4">{t('about.goal.title')}</h2>
            <p className="text-2xl md:text-3xl font-serif text-conference-blue-foreground leading-snug italic mb-12">
              "{t('about.goal.desc')}"
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
              <div className="p-6 border border-border bg-card">
                <Globe className="h-5 w-5 text-conference-accent mb-4" />
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">{t('about.format').split(':')[0]}</h4>
                <p className="text-sm text-muted-foreground">{t('about.format').split(':')[1]}</p>
              </div>
              <div className="p-6 border border-border bg-card">
                <Languages className="h-5 w-5 text-conference-accent mb-4" />
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">{t('about.languages').split(':')[0]}</h4>
                <p className="text-sm text-muted-foreground">{t('about.languages').split(':')[1]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
            <div className="w-64 h-64 shrink-0 rounded-full border-4 border-conference-blue/10 p-4 bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/img/logo_new.png"
                alt="Organizer Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="inline-flex items-center justify-center p-2 bg-conference-accent/10 rounded-full">
                  <Building2 className="h-4 w-4 text-conference-accent" />
                </div>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-conference-accent">{t('organizer.title')}</h2>
              </div>
              <h3 className="text-3xl font-serif text-conference-blue-foreground mb-6">{t('organizer.name')}</h3>
              <p className="text-conference-blue-foreground/80 font-light leading-relaxed">
                {t('organizer.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Committees Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center mb-24">
            <div className="inline-flex items-center justify-center p-3 bg-conference-accent/10 rounded-full mb-6">
              <Users className="h-6 w-6 text-conference-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-center text-conference-accent italic">{t('committee.title')}</h2>
          </div>

          {loadingCommittees ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-conference-accent border-t-transparent mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t('dashboard.committee_loading')}</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-20">
              {committees.map((committee) => {
                const chairman = committee.members.find((m: any) => m.role === 'chairman');
                const vices = committee.members.filter((m: any) => m.role === 'vice');
                const members = committee.members.filter((m: any) => m.role === 'member');

                // Перевод названия комитета
                const committeeType = committee.type;
                const committeeName = committeeType === 'organizing'
                  ? t('committee.org')
                  : committeeType === 'program'
                  ? t('committee.prog')
                  : committee.name;

                return (
                  <div key={committee.id} className="space-y-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-[1px] w-12 bg-conference-accent" />
                      <h3 className="text-xl uppercase tracking-widest font-bold text-conference-blue-foreground">{committeeName}</h3>
                    </div>

                    <div className="space-y-8">
                      {/* Chairman */}
                      {chairman && (
                        <div className="p-8 border border-conference-accent/20 bg-card rounded-none flex flex-col md:flex-row gap-8 items-center md:items-start">
                          {chairman.photo_url && (
                            <div className="w-32 h-32 shrink-0 overflow-hidden rounded-full hover:scale-105 transition-all duration-500">
                              <img
                                src={chairman.photo_url}
                                alt={chairman.full_name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-conference-accent mb-2">{t('committee.chairman')}</p>
                            <h4 className="text-2xl font-serif text-conference-blue-foreground">{chairman.full_name}</h4>
                            <p className="text-sm text-muted-foreground mt-2">{chairman.position}</p>
                          </div>
                        </div>
                      )}

                      {/* Vice Chairmen */}
                      {vices.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-6">
                          {vices.map((member: any) => (
                            <div key={member.id} className="p-6 border border-border bg-background">
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">{t('committee.vice')}</p>
                              <h4 className="text-lg font-bold text-conference-blue-foreground">{member.full_name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{member.position}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Members */}
                      {members.length > 0 && (
                        <div className="pt-8 border-t border-border">
                          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-6">{t('committee.members')}</h4>
                          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                            {members.map((member: any) => (
                              <div key={member.id} className="flex flex-col py-2 border-b border-border/50 last:border-0">
                                <span className="text-sm font-medium text-conference-blue-foreground">{member.full_name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{member.position}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Directions Section */}
      <section id="directions" className="py-32 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-xl mb-20">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="inline-flex items-center justify-center p-2 bg-conference-accent/10 rounded-full">
                <BookOpen className="h-5 w-5 text-conference-accent" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-conference-accent mb-6">
              {t('directions.title').split(' ')[0]} <br />
              <span className="italic text-conference-blue-foreground">{t('directions.title').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { num: 1, Icon: Waves },
              { num: 2, Icon: BarChart2 },
              { num: 3, Icon: Leaf },
            ].map(({ num, Icon }) => (
              <div key={num} className="bg-card p-10 border border-border hover:border-conference-accent transition-all duration-500 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center p-2 bg-conference-accent/10 rounded-lg group-hover:bg-conference-accent/20 transition-colors">
                    <Icon className="h-5 w-5 text-conference-accent" />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-conference-accent/60 group-hover:text-conference-accent transition-colors">
                    {t('directions.label')} {num}
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-conference-blue-foreground mb-6 leading-tight">
                  {t(`directions.${num}.title`)}
                </h3>
                <ul className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground font-light leading-relaxed">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-conference-accent" />
                      {t(`directions.${num}.item${item}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates Section */}
      <section id="dates" className="py-20 bg-conference-blue-deep text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-conference-accent/0 via-conference-accent to-conference-accent/0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-conference-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-conference-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6">
              <CalendarDays className="h-6 w-6 text-conference-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif italic text-white">{t('dates.title')}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { i: 1, Icon: Send },
              { i: 2, Icon: UserCheck },
              { i: 3, Icon: LayoutList },
              { i: 4, Icon: Star },
              { i: 5, Icon: BookMarked },
            ].map(({ i, Icon }) => (
              <div
                key={i}
                className="group relative"
              >
                {/* Card */}
                <div className="relative p-6 bg-background border border-conference-accent/20 rounded-xl shadow-md hover:shadow-xl hover:border-conference-accent/50 transition-all duration-300 h-full overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-conference-accent/0 to-transparent group-hover:from-conference-accent/5 transition-all duration-300 rounded-xl"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-conference-accent/10 flex items-center justify-center group-hover:bg-conference-accent/20 transition-all duration-300">
                        <Icon className="h-5 w-5 text-conference-accent" />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-conference-accent text-conference-blue-foreground text-[9px] font-bold tracking-widest uppercase rounded-md">
                        {t(`dates.item${i}.date`)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-conference-blue-foreground group-hover:text-conference-accent transition-colors duration-300 leading-snug">
                      {t(`dates.item${i}.title`)}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Participation & Publication Section */}
      <section id="requirements" className="py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 max-w-6xl mx-auto">
            {/* Publication Requirements */}
            <div className="space-y-12">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="inline-flex items-center justify-center p-2 bg-conference-accent/10 rounded-full">
                    <ClipboardList className="h-5 w-5 text-conference-accent" />
                  </div>
                </div>
                <h2 className="text-4xl font-serif text-conference-accent mb-6">{t('publication.title')}</h2>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {t('publication.general')}
                </p>
              </div>

              <div className="space-y-4">
                <AccordionItem 
                  title={t('publication.req.title')} 
                  isOpen={openAccordion === 0} 
                  onClick={() => setOpenAccordion(openAccordion === 0 ? null : 0)}
                >
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-conference-accent shrink-0 mt-0.5" />
                      {t('publication.req.volume')}
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-conference-accent shrink-0 mt-0.5" />
                      {t('publication.req.format')}
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-conference-accent shrink-0 mt-0.5" />
                      {t('publication.req.spacing')}
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-conference-accent shrink-0 mt-0.5" />
                      {t('publication.req.originality')}
                    </li>
                  </ul>
                </AccordionItem>

                <AccordionItem
                  title={t('publication.req.files_title')}
                  isOpen={openAccordion === 1}
                  onClick={() => setOpenAccordion(openAccordion === 1 ? null : 1)}
                >
                  <p className="mb-4">{t('publication.req.files')}</p>
                  <div className="grid gap-3">
                    {[t('publication.req.file_paper'), t('publication.req.file_plagiarism'), t('publication.req.file_info')].map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border">
                        <FileStack className="h-4 w-4 text-conference-accent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-conference-blue-foreground">{file}</span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </div>
            </div>

            {/* Registration Fees */}
            <div className="space-y-12">
              <div className="p-10 bg-card border border-border shadow-2xl shadow-conference-blue/5">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-conference-accent/10 rounded-full text-conference-accent mb-8">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{t('fees.title')}</span>
                </div>
                
                <div className="space-y-6 mb-10">
                  {[
                    { label: t('fees.local'), highlight: false },
                    { label: t('fees.foreign.offline'), highlight: true },
                    { label: t('fees.foreign.online'), highlight: false }
                  ].map((item, i) => (
                    <div key={i} className={cn(
                      "p-6 border transition-all duration-300",
                      item.highlight ? "border-conference-accent bg-conference-accent/5" : "border-border bg-background"
                    )}>
                      <p className="text-sm font-medium text-conference-blue-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed italic">
                  {t('fees.note')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                <div>
                  <div className="inline-flex items-center gap-2 mb-6">
                    <div className="inline-flex items-center justify-center p-2 bg-conference-accent/10 rounded-full">
                      <MessageSquare className="h-5 w-5 text-conference-accent" />
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif text-conference-blue-foreground mb-6">{t('contact.title')}</h2>
                  <p className="text-conference-blue-foreground font-light leading-relaxed max-w-md">
                    {t('contact.address')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 border border-border bg-card">
                    <Mail className="h-6 w-6 text-conference-accent" />
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground mb-1">{t('contact.email_label')}</h4>
                      <p className="text-sm font-bold text-conference-blue-foreground">{t('contact.email')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 border border-border bg-card">
                    <Phone className="h-6 w-6 text-conference-accent" />
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground mb-1">{t('contact.phone_label')}</h4>
                      <p className="text-sm font-bold text-conference-blue-foreground">{t('contact.phone')}</p>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=UWED+Tashkent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 border border-border bg-card hover:border-conference-accent transition-colors group"
                  >
                    <MapPinned className="h-6 w-6 text-conference-accent" />
                    <div className="flex-1">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground mb-1">{t('contact.location_label')}</h4>
                      <p className="text-sm font-bold text-conference-blue-foreground">{t('hero.location')}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-conference-blue-foreground group-hover:text-conference-accent transition-colors" />
                  </a>
                </div>
              </div>

              <div className="bg-card p-10 border border-border shadow-2xl shadow-conference-blue/5">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground">{t('contact.name')}</label>
                    <input type="text" className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-conference-accent transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground">{t('contact.message')}</label>
                    <textarea rows={6} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-conference-accent transition-colors resize-none"></textarea>
                  </div>
                  <Button className="w-full bg-conference-blue hover:bg-conference-accent text-white h-14 rounded-none uppercase tracking-widest font-bold text-xs transition-all">
                    {t('contact.send')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/img/logo_new.png" alt="Logo" className="h-8 w-8 object-contain rounded-full" />
                <span className="font-serif text-2xl font-semibold text-conference-blue-foreground">WICAR 2026</span>
              </div>
              <p className="text-conference-blue-foreground text-sm max-w-sm font-light leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground">{t('footer.navigation')}</h4>
              <ul className="space-y-3">
                {['home', 'about', 'directions', 'dates'].map((key) => (
                  <li key={key}>
                    <a href={`#${key}`} className="text-xs uppercase tracking-widest font-bold text-conference-blue-foreground hover:text-conference-accent transition-colors">
                      {t(`nav.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground">{t('footer.organizer')}</h4>
              <p className="text-xs font-bold text-conference-blue-foreground uppercase tracking-widest leading-relaxed">
                {t('organizer.name')}
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-conference-blue-foreground">
            <span>© 2026 WICAR Conference | {t('footer.rights')}</span>
            <div className="flex gap-8 items-center">
              <a href="https://uwed.uz" target="_blank" rel="noopener noreferrer" className="hover:text-conference-accent transition-colors">UWED.UZ</a>
              <a href="#" className="hover:text-conference-accent transition-colors">Telegram</a>
              <span className="text-border">|</span>
              <span>{t('footer.developer_label')}: <a href="https://normurodovwork.uz" target="_blank" rel="noopener noreferrer" className="hover:text-conference-accent transition-colors">Normurodov D. G.</a></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
