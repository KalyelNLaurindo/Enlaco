import { useState } from 'react';
import { useWizardStore } from '../store/wizardStore';

interface FieldErrors {
  eventName?: string;
}

/**
 * Wizard Step 0 — Event Details.
 * Collects event name (required ≤100 chars), date, suggested value,
 * and organizer message (optional ≤500 chars). Binds directly to wizardStore.
 */
export function EventDetailsStep() {
  const { eventDetails, setEventDetails, nextStep } = useWizardStore();
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const newErrors: FieldErrors = {};
    if (!eventDetails.eventName.trim()) {
      newErrors.eventName = 'Nome do evento é obrigatório.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validate()) {
      nextStep();
    }
  }

  return (
    <section className="wizard-step" aria-labelledby="event-details-title">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title" id="event-details-title">
          Detalhes do evento
        </h2>
        <p className="wizard-step__subtitle">
          Essas informações serão exibidas na tela de revelação de cada participante.
        </p>
      </header>

      <div className="field-group">
        {/* Event Name — required */}
        <div>
          <label className="field-label" htmlFor="event-name">
            Nome do evento
          </label>
          <input
            id="event-name"
            type="text"
            className={`field-input${errors.eventName ? ' is-error' : ''}`}
            placeholder="Ex: Amigo Secreto 2026"
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

        {/* Event Date — optional */}
        <div>
          <label className="field-label" htmlFor="event-date">
            Data do evento
          </label>
          <input
            id="event-date"
            type="date"
            className="field-input"
            value={eventDetails.eventDate ?? ''}
            onChange={(e) => setEventDetails({ eventDate: e.target.value })}
          />
        </div>

        {/* Suggested Value — optional */}
        <div>
          <label className="field-label" htmlFor="suggested-value">
            Valor sugerido
          </label>
          <input
            id="suggested-value"
            type="text"
            className="field-input"
            placeholder="Ex: R$ 50,00"
            value={eventDetails.suggestedValue ?? ''}
            onChange={(e) => setEventDetails({ suggestedValue: e.target.value })}
          />
        </div>

        {/* Organizer Message — optional, max 500 chars */}
        <div>
          <label className="field-label" htmlFor="organizer-message">
            Mensagem do organizador
          </label>
          <textarea
            id="organizer-message"
            className="field-textarea"
            placeholder="Uma mensagem especial para os participantes..."
            maxLength={500}
            value={eventDetails.organizerMessage ?? ''}
            onChange={(e) => setEventDetails({ organizerMessage: e.target.value })}
          />
        </div>
      </div>

      <div className="wizard-step__actions">
        <button className="btn-primary" onClick={handleNext}>
          Próximo
        </button>
      </div>
    </section>
  );
}
