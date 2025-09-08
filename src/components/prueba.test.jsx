import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';

it('demo', () => {
  render(<button>Hola mundo</button>);
  expect(screen.getByText('Hola mundo')).toBeInTheDocument();
});
