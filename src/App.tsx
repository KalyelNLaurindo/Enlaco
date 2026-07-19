import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WizardPage } from './features/wizard/WizardPage';
import { RevealPage } from './features/reveal/RevealPage';
import { OrganizerDashboard } from './features/dashboard/OrganizerDashboard';
import './index.css';

/**
 * Root application router.
 * Sitemap per Design Brief §01:
 *   /        → redirect to /criar (landing page placeholder)
 *   /criar   → Draw Creation Wizard (WizardPage)
 *   /r/:token → Participant Reveal (RevealPage)
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/criar" replace />} />
        <Route path="/criar" element={<WizardPage />} />
        <Route path="/r/:resultToken" element={<RevealPage />} />
        <Route path="/sorteio/:drawId" element={<OrganizerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
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
      <a
        href="/criar"
        style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
      >
        Criar um sorteio →
      </a>
    </div>
  );
}

export default App;
