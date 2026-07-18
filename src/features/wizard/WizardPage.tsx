import { useNavigate } from 'react-router-dom';
import { useWizardStore } from './store/wizardStore';
import { useWizardAutosave } from './hooks/useWizardAutosave';
import { WizardStepper } from './components/WizardStepper';
import { EventDetailsStep } from './components/EventDetailsStep';
import { ParticipantsStep } from './components/ParticipantsStep';
import { ExclusionRulesStep } from './components/ExclusionRulesStep';
import { ReviewStep } from './components/ReviewStep';
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
  const { currentStep } = useWizardStore();
  const { isSaving } = useWizardAutosave();
  const navigate = useNavigate();

  function handleGenerate() {
    // TODO: Phase 4 — call POST /draws API here.
    // For now, navigate to a success placeholder.
    navigate('/sorteio/demo');
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

      {/* Active step content */}
      <main className="wizard-page__content">
        {renderStep()}
      </main>
    </div>
  );
}
