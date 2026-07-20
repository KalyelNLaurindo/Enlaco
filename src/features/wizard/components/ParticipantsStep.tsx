import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import { useTranslation } from '../../../domain/services/i18nService';
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

// Wizard Step 2 — Participants step.
// Manages adding, viewing, and deleting participants.
// Enforces a minimum of 3 participants to allow the secret draw.
export function ParticipantsStep() {
  const { t } = useTranslation();
  const { participants, addParticipant, removeParticipant, nextStep, prevStep } =
    useWizardStore();
  const [form, setForm] = useState<AddForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const canAdvance = participants.length >= 3;

  // Validates participant form details before adding to the list.
  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = t('nameRequiredError');
    if (!form.channelValue.trim()) next.channelValue = t('channelValueRequiredError');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // Adds a participant to the state store and resets input fields.
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
          {t('stepParticipants')}
        </h2>
        <p className="wizard-step__subtitle">
          {t('participantsSub')}
        </p>
      </header>

      {/* Add new participant form */}
      <div className="participants-step__form">
        <div>
          <label className="field-label" htmlFor="participant-name">
            {t('nameLabel')}
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
            {t('canalLabel')}
          </label>
          <div className="participants-step__channel-row">
            <select
              className="field-input participants-step__channel-type"
              value={form.channelType}
              onChange={(e) =>
                setForm((f) => ({ ...f, channelType: e.target.value as DeliveryChannelType }))
              }
              aria-label="Channel Type"
            >
              <option value="EMAIL">{t('email')}</option>
              <option value="WHATSAPP_LINK">{t('whatsapp')}</option>
              <option value="QR">{t('inPerson')}</option>
            </select>
            <input
              id="participant-channel"
              type="text"
              className={`field-input${errors.channelValue ? ' is-error' : ''}`}
              placeholder={t('emailPlaceholder')}
              value={form.channelValue}
              onChange={(e) => setForm((f) => ({ ...f, channelValue: e.target.value }))}
            />
          </div>
          {errors.channelValue && <p className="field-error">{errors.channelValue}</p>}
        </div>

        <button className="btn-secondary participants-step__add-btn" onClick={handleAdd}>
          + {t('addBtn')}
        </button>
      </div>

      {/* Participant list rendered as chips */}
      {participants.length === 0 ? (
        <div className="participants-step__empty" data-testid="empty-participants">
          <p>{t('noParticipantsAdded')}</p>
        </div>
      ) : (
        <ul className="participants-step__chip-list" aria-label="Participants List">
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
                aria-label={`${t('removeLabel')} ${p.displayName}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Counter and requirement guidelines */}
      <p className="participants-step__count" aria-live="polite">
        {participants.length}/50 {t('participantsCounter')}
        {!canAdvance && participants.length > 0 && (
          <span className="participants-step__count-hint">
            {' '}{t('minHint')}
          </span>
        )}
      </p>

      <div className="wizard-step__actions">
        <button className="btn-secondary" onClick={prevStep}>
          {t('backBtn')}
        </button>
        <button className="btn-primary" onClick={nextStep} disabled={!canAdvance}>
          {t('nextBtn')}
        </button>
      </div>
    </section>
  );
}
