import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import type { DeliveryChannelType } from '../../../domain/types';
import './ParticipantsStep.css';

interface AddForm {
  name: string;
  channelValue: string;
  channelType: DeliveryChannelType;
}

interface FormErrors {
  name?: string;
  channelValue?: string;
}

const INITIAL_FORM: AddForm = { name: '', channelValue: '', channelType: 'EMAIL' };

/**
 * Wizard Step 1 — Participants.
 * Manages adding, displaying (as chips), and removing participants.
 * Enforces minimum of 3 participants before allowing progression.
 */
export function ParticipantsStep() {
  const { participants, addParticipant, removeParticipant, nextStep, prevStep } =
    useWizardStore();
  const [form, setForm] = useState<AddForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const canAdvance = participants.length >= 3;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Nome é obrigatório.';
    if (!form.channelValue.trim()) next.channelValue = 'Endereço do canal é obrigatório.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    addParticipant(form.name.trim(), [{ type: form.channelType, value: form.channelValue.trim() }]);
    setForm(INITIAL_FORM);
    setErrors({});
  }

  return (
    <section className="wizard-step" aria-labelledby="participants-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="participants-title">
          Participantes
        </h2>
        <p className="wizard-step__subtitle">
          Adicione pelo menos 3 participantes. Cada um precisa de um canal de entrega único.
        </p>
      </header>

      {/* Add-participant form */}
      <div className="participants-step__form">
        <div>
          <label className="field-label" htmlFor="participant-name">
            Nome
          </label>
          <input
            id="participant-name"
            type="text"
            className={`field-input${errors.name ? ' is-error' : ''}`}
            placeholder="Ex: Carlos"
            maxLength={50}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="participant-channel">
            Canal
          </label>
          <div className="participants-step__channel-row">
            <select
              className="field-input participants-step__channel-type"
              value={form.channelType}
              onChange={(e) =>
                setForm((f) => ({ ...f, channelType: e.target.value as DeliveryChannelType }))
              }
              aria-label="Tipo de canal"
            >
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP_LINK">WhatsApp</option>
              <option value="QR">QR Code</option>
            </select>
            <input
              id="participant-channel"
              type="text"
              className={`field-input${errors.channelValue ? ' is-error' : ''}`}
              placeholder="email@exemplo.com"
              value={form.channelValue}
              onChange={(e) => setForm((f) => ({ ...f, channelValue: e.target.value }))}
            />
          </div>
          {errors.channelValue && <p className="field-error">{errors.channelValue}</p>}
        </div>

        <button className="btn-secondary participants-step__add-btn" onClick={handleAdd}>
          + Adicionar
        </button>
      </div>

      {/* Participant chip list */}
      {participants.length === 0 ? (
        <div className="participants-step__empty" data-testid="empty-participants">
          <p>Nenhum participante adicionado ainda.</p>
        </div>
      ) : (
        <ul className="participants-step__chip-list" aria-label="Lista de participantes">
          {participants.map((p) => (
            <li
              key={p.id}
              className="participant-chip"
              data-testid="participant-chip"
            >
              <span className="participant-chip__avatar">
                {p.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="participant-chip__name">{p.displayName}</span>
              <button
                className="participant-chip__remove"
                onClick={() => removeParticipant(p.id)}
                aria-label={`Remover ${p.displayName}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Counter feedback */}
      <p className="participants-step__count" aria-live="polite">
        {participants.length}/50 participantes
        {!canAdvance && participants.length > 0 && (
          <span className="participants-step__count-hint">
            {' '}(mínimo 3)
          </span>
        )}
      </p>

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          Voltar
        </button>
        <button className="btn-primary" onClick={nextStep} disabled={!canAdvance}>
          Próximo
        </button>
      </div>
    </section>
  );
}
