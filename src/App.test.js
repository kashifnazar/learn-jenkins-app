import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learning Jenkins link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learning Jenkins/i);
  expect(linkElement).toBeInTheDocument();
});
