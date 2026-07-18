import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevealCard } from './RevealCard';

// Shared props that represent a valid reveal payload.
const DEFAULT_PROPS = {
  recipientName: 'Carlos Alberto',
  eventName: 'Amigo Secreto 2026',
};

describe('RevealCard', () => {
  it('should render in the masked state on initial mount', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);

    // The recipient name must NOT be visible before interaction.
    expect(screen.queryByText('Carlos Alberto')).not.toBeInTheDocument();

    // The CTA button must be present.
    expect(screen.getByRole('button', { name: /revelar/i })).toBeInTheDocument();
  });

  it('should display the event name regardless of reveal state', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Amigo Secreto 2026')).toBeInTheDocument();
  });

  it('should reveal the recipient name after clicking the reveal button', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByRole('button', { name: /revelar/i }));

    // Name must now be visible.
    expect(screen.getByText('Carlos Alberto')).toBeInTheDocument();
  });

  it('should hide the reveal button after the name is revealed', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByRole('button', { name: /revelar/i }));

    expect(screen.queryByRole('button', { name: /revelar/i })).not.toBeInTheDocument();
  });

  it('should render an optional organizer message when provided', () => {
    render(
      <RevealCard
        {...DEFAULT_PROPS}
        organizerMessage="Feliz Natal! Com carinho do seu amigo secreto."
      />
    );

    // Message must not be visible in masked state.
    expect(
      screen.queryByText('Feliz Natal! Com carinho do seu amigo secreto.')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /revelar/i }));

    // Message must appear after reveal.
    expect(
      screen.getByText('Feliz Natal! Com carinho do seu amigo secreto.')
    ).toBeInTheDocument();
  });

  it('should NOT render a message section when organizerMessage is not provided', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole('button', { name: /revelar/i }));

    // No message container should appear when prop is absent.
    expect(screen.queryByTestId('organizer-message')).not.toBeInTheDocument();
  });

  it('should have correct ARIA attributes for accessibility before and after reveal', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);

    // The masked area should be labelled for screen readers.
    const maskedRegion = screen.getByRole('region', { name: /sorteio/i });
    expect(maskedRegion).toBeInTheDocument();
  });

  it('should show a masked placeholder text while the name is hidden', () => {
    render(<RevealCard {...DEFAULT_PROPS} />);

    // A "???" or similar placeholder should communicate something is hidden.
    expect(screen.getByTestId('reveal-mask')).toBeInTheDocument();
  });
});
