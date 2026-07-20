import './WizardStepper.css';

interface WizardStepperProps {
  currentStep: number;
  steps: string[];
}

/**
 * Linear step indicator for the creation wizard.
 * Shows step labels on desktop, condensed dot-indicator on mobile.
 * Design Brief §03: "step indicator pinned at top".
 */
export function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  return (
    <nav className="wizard-stepper" aria-label="Progresso do wizard">
      <ol className="wizard-stepper__list">
        {steps.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <li
              key={idx}
              className={[
                'wizard-stepper__step',
                isCompleted ? 'is-completed' : '',
                isActive ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="wizard-stepper__indicator" aria-hidden="true">
                {isCompleted ? '✓' : idx + 1}
              </span>
              <span className="wizard-stepper__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
