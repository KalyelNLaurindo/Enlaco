import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      };

      // 5. Persist the draw in localStorage
      localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(completedDraw));

      // 6. Reset the wizard store state
      reset();

      // 7. Navigate to the organizer dashboard
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
    </div>
  );
}
