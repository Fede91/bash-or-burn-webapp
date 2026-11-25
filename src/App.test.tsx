import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bash or Burn');
  });

  it('marks the verdict element', () => {
    const { container } = render(<App />);
    const el = container.querySelector('[data-verdict]');
    expect(el).toHaveAttribute('data-verdict', 'burn');
    expect(el).toHaveClass('text-verdict');
  });
});
