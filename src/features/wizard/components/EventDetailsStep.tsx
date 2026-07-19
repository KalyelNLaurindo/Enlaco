import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';
import { useTranslation } from '../../../domain/services/i18nService';

interface FieldErrors {
  eventName?: string;
}

// Formulário da Etapa 1 — Detalhes do Evento.
// Coleta o nome (obrigatório), data, orçamento e mensagem aos participantes.
export function EventDetailsStep() {
  const { t } = useTranslation();
  const { eventDetails, setEventDetails, nextStep } = useWizardStore();
  const [errors, setErrors] = useState<FieldErrors>({});

  // Valida se o campo obrigatório de nome do evento foi preenchido.
  function validate(): boolean {
    const newErrors: FieldErrors = {};
    if (!eventDetails.eventName.trim()) {
      newErrors.eventName = t('eventNameRequiredError');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Avança para a próxima etapa caso o formulário seja válido.
  function handleNext() {
    if (validate()) {
      nextStep();
    }
  }

  return (
    <section className="wizard-step" aria-labelledby="event-details-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="event-details-title">
          {t('stepDetails')}
        </h2>
        <p className="wizard-step__subtitle">
          {t('eventDetailsSub')}
        </p>
      </header>

      <div className="field-group">
        {/* Nome do Evento (Campo Obrigatório) */}
        <div>
          <label className="field-label" htmlFor="event-name">
            {t('eventNameLabel')}
          </label>
          <input
            id="event-name"
            type="text"
            className={`field-input${errors.eventName ? ' is-error' : ''}`}
            placeholder={t('eventNamePlaceholder')}
            maxLength={100}
            value={eventDetails.eventName}
            onChange={(e) => setEventDetails({ eventName: e.target.value })}
            aria-describedby={errors.eventName ? 'event-name-error' : undefined}
            aria-invalid={!!errors.eventName}
          />
          {errors.eventName && (
            <p id="event-name-error" className="field-error" role="alert">
              {errors.eventName}
            </p>
          )}
        </div>

        {/* Data do Evento (Opcional) */}
        <div>
          <label className="field-label" htmlFor="event-date">
            {t('eventDateLabel')}
          </label>
          <input
            id="event-date"
            type="date"
            className="field-input"
            value={eventDetails.eventDate ?? ''}
            onChange={(e) => setEventDetails({ eventDate: e.target.value })}
          />
        </div>

        {/* Valor Sugerido / Orçamento (Opcional) */}
        <div>
          <label className="field-label" htmlFor="suggested-value">
            {t('suggestedValueLabel')}
          </label>
          <input
            id="suggested-value"
            type="text"
            className="field-input"
            placeholder={t('suggestedValuePlaceholder')}
            value={eventDetails.suggestedValue ?? ''}
            onChange={(e) => setEventDetails({ suggestedValue: e.target.value })}
          />
        </div>

        {/* Mensagem Opcional do Organizador para Exibição */}
        <div>
          <label className="field-label" htmlFor="organizer-message">
            {t('messageLabel')}
          </label>
          <textarea
            id="organizer-message"
            className="field-textarea"
            placeholder={t('messagePlaceholder')}
            maxLength={500}
            value={eventDetails.organizerMessage ?? ''}
            onChange={(e) => setEventDetails({ organizerMessage: e.target.value })}
          />
        </div>
      </div>

      <div className="wizard-step__actions">
        <button className="btn-primary" onClick={handleNext}>
          {t('nextBtn')}
        </button>
      </div>
    </section>
  );
}
