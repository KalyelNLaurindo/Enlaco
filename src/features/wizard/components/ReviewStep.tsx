import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import { useTranslation } from '../../../domain/services/i18nService';
import './ReviewStep.css';

interface ReviewStepProps {
  // Callback triggered when the organizer clicks generate
  onGenerate: (pin?: string) => void;
}

// Wizard Step 4 — Final Review step.
// Summarizes event details, participants list, and exclusion rules.
// Gated by a mandatory checkbox to ensure the user knows generation is final.
export function ReviewStep({ onGenerate }: ReviewStepProps) {
  const { t } = useTranslation();
  const { participants, exclusionRules, eventDetails, organizerBlind, prevStep } =
    useWizardStore();
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState('');

  // Retrieves display name of a participant from their unique ID.
  function getParticipantName(id: string): string {
    return participants.find((p) => p.id === id)?.displayName ?? id;
  }

  return (
    <section className="wizard-step" aria-labelledby="review-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="review-title">
          {t('stepReview')}
        </h2>
        <p className="wizard-step__subtitle">
          {t('reviewSub')}
        </p>
      </header>

      {/* Event Details Summary */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">{t('stepDetails')}</h3>
        <p className="review-step__event-name">{eventDetails.eventName}</p>
        {eventDetails.eventDate && (
          <p className="review-step__detail">📅 {eventDetails.eventDate}</p>
        )}
        {eventDetails.suggestedValue && (
          <p className="review-step__detail">🎁 {t('suggestedValueLabel')}: {eventDetails.suggestedValue}</p>
        )}
      </div>

      {/* Organizer / Draw Mode */}
      <div className="review-step__card" data-testid="review-blind-mode">
        <h3 className="review-step__section-title">{t('modeLabel')}</h3>
        <p className="review-step__detail">
          {organizerBlind ? t('blindModeActive') : t('openModeActive')}
        </p>
      </div>

      {/* Security Audit PIN */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">🔒 {t('pinLabel')}</h3>
        <p className="review-step__detail" style={{ marginBottom: '0.75rem', fontSize: '13px' }}>
          {t('pinHelpText')}
        </p>
        <input
          type="text"
          pattern="[0-9]*"
          maxLength={8}
          placeholder="Ex: 1234"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          style={{
            width: '100%',
            maxWidth: '200px',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-surface-raised, #212127)',
            border: '1px solid var(--color-border-default, #2C2C34)',
            borderRadius: '8px',
            color: 'var(--text-primary, #F5F5F7)',
            fontSize: '14px',
            fontFamily: 'monospace',
            textAlign: 'center',
            letterSpacing: '0.25em'
          }}
        />
      </div>

      {/* Participants List */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">
          {t('stepParticipants')} ({participants.length})
        </h3>
        <ul className="review-step__list">
          {participants.map((p) => (
            <li key={p.id} className="review-step__item">
              <span className="review-step__avatar">
                {p.displayName.charAt(0).toUpperCase()}
              </span>
              <span>{p.displayName}</span>
              <span className="review-step__channel-badge">
                {p.channels[0].type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusion Rules List */}
      <div className="review-step__card" data-testid="review-exclusions">
        <h3 className="review-step__section-title">
          {t('stepExclusions')} ({exclusionRules.length})
        </h3>
        {exclusionRules.length === 0 ? (
          <p className="review-step__empty">{t('noExclusions')}</p>
        ) : (
          <ul className="review-step__list">
            {exclusionRules.map((rule, idx) => (
              <li key={idx} className="review-step__item review-step__item--rule" data-testid={`exclusion-rule-${idx}`}>
                <strong>{getParticipantName(rule.participantA)}</strong>
                <span className="review-step__rule-sep"> ↔ </span>
                <strong>{getParticipantName(rule.participantB)}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmed / Irreversible checkbox gate */}
      <div className="review-step__gate">
        <label className="review-step__gate-label">
          <input
            type="checkbox"
            className="review-step__checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            aria-label={t('checkboxAcknowledge')}
          />
          <span>
            {t('checkboxAcknowledge')}
          </span>
        </label>
      </div>

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          {t('backBtn')}
        </button>
        <button
          className="btn-primary review-step__generate-btn"
          onClick={() => onGenerate(pin || undefined)}
          disabled={!confirmed}
          aria-describedby="generate-warning"
        >
          {t('generateBtn')}
        </button>
      </div>

      <p id="generate-warning" className="review-step__warning">
        {t('generateWarning')}
      </p>
    </section>
  );
}
