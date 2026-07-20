import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { SuccessPage } from '../../../../features/wizard/components/SuccessPage';
import { I18nProvider } from '../../../../domain/services/i18nService';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ drawId: 'test-draw-123' }),
  };
});

// Mock qrcode module
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqr'),
  }
}));

describe('SuccessPage Component', () => {
  const mockDraw = {
    drawId: 'test-draw-123',
    status: 'GENERATED',
    createdAt: new Date().toISOString(),
    organizerBlind: false,
    eventDetails: {
      eventName: 'Churrasco de Fim de Ano',
    },
    participants: [
      { id: 'p1', displayName: 'Carlos', channels: [{ type: 'WHATSAPP_LINK', value: '11999999999' }], revealUrl: '/r/token1' },
      { id: 'p2', displayName: 'Marta', channels: [{ type: 'EMAIL', value: 'marta@test.com' }], revealUrl: '/r/token2' },
    ],
    exclusionRules: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <I18nProvider>
        <HashRouter>
          <SuccessPage />
        </HashRouter>
      </I18nProvider>
    );
  };

  it('renders error state when draw is not found in localStorage', () => {
    renderComponent();
    expect(screen.getByText('Sorteio não encontrado')).toBeInTheDocument();
  });

  it('renders success page title and details when draw is found', () => {
    localStorage.setItem('enlaco-draw-test-draw-123', JSON.stringify(mockDraw));
    renderComponent();
    expect(screen.getByText('Sorteio concluído!')).toBeInTheDocument();
    expect(screen.getByText('Ver resumo (Painel)')).toBeInTheDocument();
  });

  it('navigates to dashboard on clicking view summary', () => {
    localStorage.setItem('enlaco-draw-test-draw-123', JSON.stringify(mockDraw));
    renderComponent();
    fireEvent.click(screen.getByText('Ver resumo (Painel)'));
    expect(mockNavigate).toHaveBeenCalledWith('/sorteio/test-draw-123');
  });

  it('opens share modal when clicking Share QR Code', async () => {
    localStorage.setItem('enlaco-draw-test-draw-123', JSON.stringify(mockDraw));
    renderComponent();
    fireEvent.click(screen.getByText('Compartilhar QR Code'));
    expect(screen.getByText('Compartilhar QR Codes')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Marta')).toBeInTheDocument();
  });
});
