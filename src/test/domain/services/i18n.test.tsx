import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useTranslation } from '../../../domain/services/i18nService';

describe('Sistema de Internacionalização (i18n)', () => {
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
});
