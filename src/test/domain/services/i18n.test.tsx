import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useTranslation } from '../../../domain/services/i18nService';

describe('Sistema de Internacionalização (i18n)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  it('deve iniciar com o idioma padrão (pt) e retornar traduções corretas', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current.language).toBe('pt');
    expect(result.current.t('appName')).toBe('Enlaço');
    expect(result.current.t('createDraw')).toBe('Criar Sorteio');
  });

  it('deve mudar o idioma dinamicamente e salvar no localStorage', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
    expect(result.current.t('createDraw')).toBe('Create Draw');
    expect(localStorage.getItem('enlaco_lang')).toBe('en');
  });

  it('deve suportar tradução para múltiplos idiomas (ex: es, fr, de, ru)', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.setLanguage('es');
    });
    expect(result.current.t('createDraw')).toBe('Crear Sorteo');

    act(() => {
      result.current.setLanguage('fr');
    });
    expect(result.current.t('createDraw')).toBe('Créer un Tirage');

    act(() => {
      result.current.setLanguage('de');
    });
    expect(result.current.t('createDraw')).toBe('Auslosung Erstellen');

    act(() => {
      result.current.setLanguage('ru');
    });
    expect(result.current.t('createDraw')).toBe('Создать Жеребьевку');
  });

  it('deve retornar traduções para as novas telas (LandingPage e SuccessPage)', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    // Test default language (pt)
    expect(result.current.t('welcomeTitle')).toBe('Bem-vindo!');
    expect(result.current.t('offlineLabel')).toBe('Funciona offline');
    expect(result.current.t('successTitle')).toBe('Sorteio concluído!');

    // Change to English
    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.t('welcomeTitle')).toBe('Welcome!');
    expect(result.current.t('offlineLabel')).toBe('Works offline');
    expect(result.current.t('successTitle')).toBe('Draw completed!');
  });
});
