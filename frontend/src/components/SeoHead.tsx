import React from 'react';
import { useLanguage } from './LanguageProvider';

export function SeoHead() {
  const { t } = useLanguage();
  
  const title = t('hero.title');
  const description = t('hero.subtitle');
  
  return (
    <React.Fragment>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </React.Fragment>
  );
}
