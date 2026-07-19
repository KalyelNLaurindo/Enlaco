import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import './ReviewStep.css';

interface ReviewStepProps {
  /** Called when the organizer confirms and clicks "Gerar Sorteio". */
  onGenerate: (pin?: string) => void;
}

/**
 * Wizard Step 3 — Review & Generate.
 * Blocking final confirmation screen. Shows the full participant list,
 * all exclusion rules, event details, and blind mode status.
 * A mandatory irreversibility checkbox gates the "Gerar Sorteio" action.
 */
export function ReviewStep({ onGenerate }: ReviewStepProps) {
  const { participants, exclusionRules, eventDetails, organizerBlind, prevStep } =
    useWizardStore();
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState('');

  function getParticipantName(id: string): string {
    return participants.find((p) => p.id === id)?.displayName ?? id;
  }

  return (
    <section className="wizard-step" aria-labelledby="review-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="review-title">
          Revisão final
        </h2>
        <p className="wizard-step__subtitle">
          Confirme todos os dados antes de gerar o sorteio. Esta ação é irreversível.
        </p>
      </header>

      {/* Event details summary */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">Evento</h3>
        <p className="review-step__event-name">{eventDetails.eventName}</p>
        {eventDetails.eventDate && (
          <p className="review-step__detail">📅 {eventDetails.eventDate}</p>
        )}
        {eventDetails.suggestedValue && (
          <p className="review-step__detail">🎁 Valor sugerido: {eventDetails.suggestedValue}</p>
        )}
      </div>

      {/* Blind mode */}
      <div className="review-step__card" data-testid="review-blind-mode">
        <h3 className="review-step__section-title">Modo do organizador</h3>
        <p className="review-step__detail">
          {organizerBlind
            ? '🙈 Modo cego ativado — você participará sem ver os resultados'
            : '👁 Modo normal — você verá todos os pares após a geração'}
        </p>
      </div>

      {/* Audit PIN (Optional) */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">🔒 Senha/PIN de Auditoria (Opcional)</h3>
        <p className="review-step__detail" style={{ marginBottom: '0.75rem', fontSize: '13px' }}>
          Defina uma senha numérica (PIN) para proteger os emparelhamentos no painel contra olhares curiosos.
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

      {/* Participants */}
      <div className="review-step__card">
        <h3 className="review-step__section-title">
          Participantes ({participants.length})
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

      {/* Exclusion Rules */}
      <div className="review-step__card" data-testid="review-exclusions">
        <h3 className="review-step__section-title">
          Regras de exclusão ({exclusionRules.length})
        </h3>
        {exclusionRules.length === 0 ? (
          <p className="review-step__empty">Nenhuma exclusão configurada.</p>
        ) : (
          <ul className="review-step__list">
            {exclusionRules.map((rule, idx) => (
              <li key={idx} className="review-step__item review-step__item--rule">
                <strong>{getParticipantName(rule.participantA)}</strong>
                <span className="review-step__rule-sep"> ↔ </span>
                <strong>{getParticipantName(rule.participantB)}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Irreversibility gate — mandatory checkbox */}
      <div className="review-step__gate">
        <label className="review-step__gate-label">
          <input
            type="checkbox"
            className="review-step__checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            aria-label="Entendo que esta ação é irreversível"
          />
          <span>
            Entendo que a geração do sorteio é <strong>irreversível</strong> e não poderá ser
            desfeita.
          </span>
        </label>
      </div>

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          Voltar
        </button>
        <button
          className="btn-primary review-step__generate-btn"
          onClick={() => onGenerate(pin || undefined)}
          disabled={!confirmed}
          aria-describedby="generate-warning"
        >
          Gerar Sorteio
        </button>
      </div>

      <p id="generate-warning" className="review-step__warning">
        ⚠️ Ao confirmar, todos os participantes receberão seus links automaticamente.
      </p>
    </section>
  );
}
