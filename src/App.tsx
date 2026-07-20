import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { SuccessPage } from './features/wizard/components/SuccessPage';
import { RevealPage } from './features/reveal/RevealPage';
import { OrganizerDashboard } from './features/dashboard/OrganizerDashboard';
import { I18nProvider } from './domain/services/i18nService';
import './index.css';

// Roteador principal do aplicativo. Mapeia as rotas públicas de criação, revelação e painel.
function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/criar" element={<LandingPage />} />
          <Route path="/sorteio/:drawId/concluido" element={<SuccessPage />} />
          <Route path="/r/:resultToken" element={<RevealPage />} />
          <Route path="/sorteio/:drawId" element={<OrganizerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </I18nProvider>
  );
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)',
      }}
    >
      <p style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        404
      </p>
      <p>Página não encontrada.</p>
      <Link
        to="/criar"
        style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
      >
        Criar um sorteio →
      </Link>
    </div>
  );
}

export default App;
