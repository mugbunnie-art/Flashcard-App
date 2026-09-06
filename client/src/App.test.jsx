import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /mugbunnie study/i })).toBeInTheDocument();
  });

  it('renders a sample flashcard', () => {
    render(<App />);

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });
});
