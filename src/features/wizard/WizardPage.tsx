import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWizardStore } from './store/wizardStore';
import { useWizardAutosave } from './hooks/useWizardAutosave';
import { WizardStepper } from './components/WizardStepper';
import { EventDetailsStep } from './components/EventDetailsStep';
import { ParticipantsStep } from './components/ParticipantsStep';
import { ExclusionRulesStep } from './components/ExclusionRulesStep';
import { ReviewStep } from './components/ReviewStep';
import { generateDraw, DrawInfeasibleError } from '../../domain/services/drawGenerator';
import { encodeRevealToken } from '../../domain/services/tokenService';
import type { Draw } from '../../domain/types';
import './WizardPage.css';

const WIZARD_STEPS = [
  'Evento',
  'Participantes',
  'Exclusões',
  'Revisão',
];

interface HistoryItem {
  id: string;
  name: string;
}

/**
 * /criar — Draw Creation Wizard page.
 * Orchestrates the 4-step wizard using currentStep from the Zustand store.
 * The autosave hook keeps local state persisted throughout navigation.
 */
export function WizardPage() {
  const { participants, exclusionRules, eventDetails, organizerBlind, currentStep, reset } = useWizardStore();
  const { isSaving } = useWizardAutosave();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load created draws history on mount
  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
      const historyItems: HistoryItem[] = [];
      
      storedHistory.forEach((id) => {
        const drawData = localStorage.getItem(`enlaco-draw-${id}`);
        if (drawData) {
          const parsed = JSON.parse(drawData) as Draw;
          historyItems.push({ id, name: parsed.eventDetails.eventName });
        }
      });
      setHistory(historyItems);
    } catch (err) {
      console.error('Failed to load draw history', err);
    }
  }, []);

  function handleGenerate() {
    setError(null);
    try {
      // 1. Run the backtracking MRV algorithm locally
      const assignmentMap = generateDraw(participants, exclusionRules);

      // 2. Generate a unique draw ID
      const drawId = `d_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      // 3. Map participants to include their pre-generated reveal URLs containing encoded match data
      const participantsWithLinks = participants.map((p) => {
        const receiverId = assignmentMap.get(p.id)!;
        const receiver = participants.find((r) => r.id === receiverId)!;
        
        // Encode the match in a secure URL-safe token
        const token = encodeRevealToken(p.displayName, receiver.displayName, eventDetails, drawId, p.id);
        const revealUrl = `/r/${token}`;

        return {
          ...p,
          revealUrl,
        };
      });

      // 4. Construct the completed Draw object
      const completedDraw: Draw = {
        drawId,
        status: 'GENERATED',
        createdAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        organizerBlind,
        eventDetails,
        participants: participantsWithLinks,
        exclusionRules,
        tokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours default TTL
      };

      // 5. Persist the draw in localStorage
      localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(completedDraw));

      // 6. Update draw history
      const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
      const updatedHistory = Array.from(new Set([...storedHistory, drawId]));
      localStorage.setItem('enlaco_draw_history', JSON.stringify(updatedHistory));

      // 7. Reset the wizard store state
      reset();

      // 8. Navigate to the organizer dashboard
      navigate(`/sorteio/${drawId}`);
    } catch (err) {
      if (err instanceof DrawInfeasibleError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao gerar o sorteio. Por favor, tente novamente.');
        console.error(err);
      }
    }
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImportError(null);
    const code = importCode.trim();
    if (!code) return;

    // Extract ID if a full URL was pasted
    let extractedId = code;
    if (code.includes('/sorteio/')) {
      extractedId = code.split('/sorteio/').pop()?.split('?')[0] || code;
    }

    const drawData = localStorage.getItem(`enlaco-draw-${extractedId}`);
    if (!drawData) {
      setImportError('Código ou link inválido. Sorteio não encontrado neste navegador.');
      return;
    }

    // Save imported draw ID to history
    const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
    const updatedHistory = Array.from(new Set([...storedHistory, extractedId]));
    localStorage.setItem('enlaco_draw_history', JSON.stringify(updatedHistory));

    setImportCode('');
    navigate(`/sorteio/${extractedId}`);
  }

  function renderStep() {
    switch (currentStep) {
      case 0: return <EventDetailsStep />;
      case 1: return <ParticipantsStep />;
      case 2: return <ExclusionRulesStep />;
      case 3: return <ReviewStep onGenerate={handleGenerate} />;
      default: return <EventDetailsStep />;
    }
  }

  return (
    <div className="wizard-page">
      {/* Sticky stepper — always visible */}
      <WizardStepper currentStep={currentStep} steps={WIZARD_STEPS} />

      {/* Autosave indicator */}
      {isSaving && (
        <div className="wizard-page__saving" aria-live="polite" aria-label="Salvando automaticamente">
          <span className="wizard-page__saving-dot" />
          Salvando…
        </div>
      )}

      {error && (
        <div 
          className="wizard-page__error" 
          role="alert" 
          style={{
            maxWidth: '600px',
            margin: '1rem auto 0 auto',
            padding: '1rem',
            backgroundColor: 'rgba(255, 92, 92, 0.1)',
            border: '1px solid rgba(255, 92, 92, 0.3)',
            color: '#FF5C5C',
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Active step content */}
      <main className="wizard-page__content">
        {renderStep()}
      </main>

      {/* History and Import Sidebar/Footer section - only rendered on the event details step (first page) to keep wizard focused */}
      {currentStep === 0 && (
        <section className="wizard-history-panel" style={{ maxWidth: '600px', margin: '2rem auto 0 auto', padding: '1.5rem', backgroundColor: 'var(--color-bg-surface, #18181D)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '18px', marginBottom: '1rem' }}>Sorteios Anteriores</h3>
          
          {history.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', borderRadius: '12px', border: '1px solid var(--color-border-default, #2C2C34)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                  <Link to={`/sorteio/${item.id}`} style={{ color: 'var(--color-accent-default, #FF2E93)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>Acessar Painel →</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 1.5rem 0' }}>Nenhum sorteio anterior registrado.</p>
          )}

          <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-border-default, #2C2C34)', paddingTop: '1rem' }}>
            <label htmlFor="import-code" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Importar Sorteio Existente</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="import-code"
                type="text"
                placeholder="Cole o link ou código do painel..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
              <button type="submit" style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--color-accent-default, #FF2E93)', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Importar</button>
            </div>
            {importError && <p style={{ color: '#FF5C5C', fontSize: '12px', margin: 0 }}>⚠️ {importError}</p>}
          </form>
        </section>
      )}
    </div>
  );
}
