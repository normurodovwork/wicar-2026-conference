import { useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export function SeoHead() {
  const { t } = useLanguage();

  const title = t('hero.title');
  const description = t('hero.subtitle');

  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);

    return () => {
      document.title = 'WICAR 2026';
    };
  }, [title, description]);

  return null;
}
