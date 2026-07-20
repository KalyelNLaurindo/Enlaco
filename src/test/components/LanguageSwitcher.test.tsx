import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { I18nProvider } from '../../domain/services/i18nService';

describe('LanguageSwitcher Component', () => {
  const renderComponent = () => {
    return render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );
  };

  it('renders only emoji flags for language buttons without text labels', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(6);

    // Verify button content is exactly the flag and contains no text labels like PT, EN, ES, FR, DE, RU
    buttons.forEach((btn) => {
      const content = btn.textContent?.trim() || '';
      // It should not contain any Latin letters
      expect(content).not.toMatch(/[A-Za-z]/);
      // It should be non-empty and have a length of 4 (emoji flags consist of 2 surrogate pairs in UTF-16)
      expect(content.length).toBe(4);
    });
  });
});
