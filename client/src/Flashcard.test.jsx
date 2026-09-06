import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from './Flashcard';

describe('Flashcard', () => {
  const question = 'What is the capital of France?';
  const answer = 'Paris';

  it('shows the question and keeps the answer hidden initially', () => {
    render(<Flashcard question={question} answer={answer} />);

    expect(screen.getByText(question)).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText(answer)).toHaveAttribute('aria-hidden', 'true');
  });

  it('reveals the answer when the card is clicked', () => {
    render(<Flashcard question={question} answer={answer} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText(answer)).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText(question)).toHaveAttribute('aria-hidden', 'true');
  });

  it('flips back to the question on a second click', () => {
    render(<Flashcard question={question} answer={answer} />);
    const card = screen.getByRole('button');

    fireEvent.click(card);
    fireEvent.click(card);

    expect(screen.getByText(question)).toHaveAttribute('aria-hidden', 'false');
  });

  it('flips when Enter is pressed while the card is focused', () => {
    render(<Flashcard question={question} answer={answer} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(screen.getByText(answer)).toHaveAttribute('aria-hidden', 'false');
  });

  it('flips when Space is pressed while the card is focused', () => {
    render(<Flashcard question={question} answer={answer} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

    expect(screen.getByText(answer)).toHaveAttribute('aria-hidden', 'false');
  });
});
