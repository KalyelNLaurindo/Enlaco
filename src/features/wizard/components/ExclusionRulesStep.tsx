import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import './ExclusionRulesStep.css';

/**
 * Wizard Step 2 — Exclusion Rules.
 * Implements the two-tap "select A → select B" interaction described in the
 * Design Brief §03. Every rule is bidirectional per ADR-01.
 */
export function ExclusionRulesStep() {
  const { participants, exclusionRules, addExclusionRule, removeExclusionRule, nextStep, prevStep } =
    useWizardStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleParticipantClick(id: string) {
    if (!selectedId) {
      // First tap — select participant A.
      setSelectedId(id);
    } else if (selectedId === id) {
      // Tapping the same participant deselects.
      setSelectedId(null);
    } else {
      // Second tap — create the exclusion rule between A and B.
      addExclusionRule(selectedId, id);
      setSelectedId(null);
    }
  }

  function getParticipantName(id: string): string {
    return participants.find((p) => p.id === id)?.displayName ?? id;
  }

  return (
    <section className="wizard-step" aria-labelledby="exclusions-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="exclusions-title">
          Regras de exclusão
        </h2>
        <p className="wizard-step__subtitle">
          Selecione dois participantes que não podem se sortear mutuamente.
          {selectedId && (
            <strong className="exclusions-step__hint">
              {' '}Agora selecione quem <em>{getParticipantName(selectedId)}</em> não pode tirar.
            </strong>
          )}
        </p>
      </header>

      {/* Participant selector grid */}
      <ul className="exclusions-step__grid" aria-label="Selecionar participantes">
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

      {/* Rules list */}
      {exclusionRules.length === 0 ? (
        <div className="exclusions-step__empty" data-testid="empty-exclusions">
          <p>Nenhuma exclusão configurada. Esta etapa é opcional.</p>
        </div>
      ) : (
        <ul className="exclusions-step__rules" aria-label="Regras configuradas">
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
                aria-label="Remover regra"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          Voltar
        </button>
        <button className="btn-primary" onClick={nextStep}>
          Próximo
        </button>
      </div>
    </section>
  );
}
