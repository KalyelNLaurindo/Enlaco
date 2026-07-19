import React from 'react';
import { useTranslation, Language } from '../domain/services/i18nService';

// Componente visual premium para alternar entre os 6 idiomas suportados.
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const options: { value: Language; label: string }[] = [
    { value: 'pt', label: '🇧🇷 PT' },
    { value: 'en', label: '🇺🇸 EN' },
    { value: 'es', label: '🇪🇸 ES' },
    { value: 'fr', label: '🇫🇷 FR' },
    { value: 'de', label: '🇩🇪 DE' },
    { value: 'ru', label: '🇷🇺 RU' },
  ];

  return (
    <div 
      className="lang-switcher"
      style={{
        display: 'flex',
        gap: '0.35rem',
        background: 'rgba(33, 33, 39, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--color-border-default, #2C2C34)',
        padding: '0.25rem 0.5rem',
        borderRadius: '20px',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLanguage(opt.value)}
          style={{
            background: language === opt.value ? 'var(--color-accent-default, #FF2E93)' : 'transparent',
            color: language === opt.value ? '#FFF' : 'var(--text-secondary, #A3A3AE)',
            border: 'none',
            borderRadius: '16px',
            padding: '0.3rem 0.6rem',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={opt.label}
        >
          {opt.label.split(' ')[1]}
        </button>
      ))}
    </div>
  );
};
