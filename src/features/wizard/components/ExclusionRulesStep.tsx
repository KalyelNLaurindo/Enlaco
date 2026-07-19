import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import { useTranslation } from '../../../domain/services/i18nService';
import './ExclusionRulesStep.css';

// Wizard Step 3 — Exclusion Rules step.
// Enables setting bidirectional rules using a simple two-tap selection mechanism.
export function ExclusionRulesStep() {
  const { t } = useTranslation();
  const { participants, exclusionRules, addExclusionRule, removeExclusionRule, nextStep, prevStep } =
    useWizardStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Handles clicking a participant chip to create or deselect an exclusion rule.
  function handleParticipantClick(id: string) {
    if (!selectedId) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      addExclusionRule(selectedId, id);
      setSelectedId(null);
    }
  }

  // Returns the display name of a participant from their unique ID.
  function getParticipantName(id: string): string {
    return participants.find((p) => p.id === id)?.displayName ?? id;
  }

  return (
    <section className="wizard-step" aria-labelledby="exclusions-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="exclusions-title">
          {t('stepExclusions')}
        </h2>
        <p className="wizard-step__subtitle">
          {t('exclusionsSub')}
          {selectedId && (
            <strong className="exclusions-step__hint">
              {' '}{t('exclusionsHint').replace('{name}', getParticipantName(selectedId))}
            </strong>
          )}
        </p>
      </header>

      {/* Participant grid selection */}
      <ul className="exclusions-step__grid" aria-label="Select participants">
        {participants.map((p) => {
          const isSelected = selectedId === p.id;
          return (
            <li key={p.id}>
              <button
                className={`exclusions-step__chip${isSelected ? ' is-selected' : ''}`}
                data-testid={`participant-select-${p.id}`}
                onClick={() => handleParticipantClick(p.id)}
                aria-pressed={isSelected}
              >
                <span className="exclusions-step__avatar">
                   {p.displayName.charAt(0).toUpperCase()}
                </span>
                {p.displayName}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Existing configured rules list */}
      {exclusionRules.length === 0 ? (
        <div className="exclusions-step__empty" data-testid="empty-exclusions">
          <p>{t('noExclusions')}</p>
        </div>
      ) : (
        <ul className="exclusions-step__rules" aria-label={t('rulesListTitle')}>
          {exclusionRules.map((rule, idx) => (
            <li key={idx} className="exclusions-step__rule" data-testid={`exclusion-rule-${idx}`}>
              <span className="exclusions-step__rule-pair">
                <strong>{getParticipantName(rule.participantA)}</strong>
                <span className="exclusions-step__rule-sep"> ↔ </span>
                <strong>{getParticipantName(rule.participantB)}</strong>
              </span>
              <button
                className="exclusions-step__rule-remove"
                onClick={() => removeExclusionRule(rule.participantA, rule.participantB)}
                aria-label={t('removeRule')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          {t('backBtn')}
        </button>
        <button className="btn-primary" onClick={nextStep}>
          {t('nextBtn')}
        </button>
      </div>
    </section>
  );
}
