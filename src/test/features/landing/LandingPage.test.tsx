import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { LandingPage } from '../../../features/landing/LandingPage';
import { I18nProvider } from '../../../domain/services/i18nService';

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
let mockPathname = '/';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
  };
});

describe('LandingPage Component - Unified Wizard flow', () => {
  beforeEach(() => {
    mockPathname = '/';
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <I18nProvider>
        <HashRouter>
          <LandingPage />
        </HashRouter>
      </I18nProvider>
    );
  };

  it('renders landing page brand name and slogan on root path', () => {
    renderComponent();
    expect(screen.getAllByText('Enlaço').length).toBeGreaterThan(0);
    expect(screen.getByText('LAÇOS QUE CONECTAM HISTÓRIAS E SURPRESAS.')).toBeInTheDocument();
  });

  it('navigates to /criar on clicking Create button', () => {
    renderComponent();
    const createBtn = screen.getByText('Criar novo sorteio');
    fireEvent.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/criar');
  });

  it('renders EventDetailsStep inside phone when pathname is /criar', () => {
    mockPathname = '/criar';
    renderComponent();
    
    // In EventDetailsStep, we should find eventName label/placeholder
    expect(screen.getByText('Nome do Evento')).toBeInTheDocument();
  });
});
